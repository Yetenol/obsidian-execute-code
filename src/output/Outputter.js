import { EventEmitter } from "events";
import loadEllipses from "../svgs/loadEllipses";
import loadSpinner from "../svgs/loadSpinner";
import FileAppender from "./FileAppender";
import { Component, MarkdownRenderer, normalizePath, setIcon } from "obsidian";
export const TOGGLE_HTML_SIGIL = `TOGGLE_HTML_${Math.random().toString(16).substring(2)}`;
const SEPARATOR = '<IPC_SEPERATOR>';
export class Outputter extends EventEmitter {
    constructor(codeBlock, settings, view, app, srcFile) {
        super();
        this.runningSubprocesses = new Set();
        this.settings = settings;
        this.app = app;
        this.srcFile = srcFile;
        this.inputState = this.settings.allowInput ? "INACTIVE" : "NOT_DOING";
        this.codeBlockElement = codeBlock;
        this.hadPreviouslyPrinted = false;
        this.escapeHTML = true;
        this.htmlBuffer = "";
        this.blockRunState = "INITIAL";
        this.saveToFile = new FileAppender(view, codeBlock.parentElement);
    }
    /**
     * Clears the output log.
     */
    clear() {
        if (this.outputElement) {
            for (const child of Array.from(this.outputElement.children)) {
                if (child instanceof HTMLSpanElement)
                    this.outputElement.removeChild(child);
            }
        }
        this.lastPrintElem = null;
        this.hadPreviouslyPrinted = false;
        this.lastPrinted = "";
        if (this.clearButton)
            this.clearButton.className = "clear-button-disabled";
        this.closeInput();
        this.inputState = "INACTIVE";
        // clear output block in file
        this.saveToFile.clearOutput();
        // Kill code block
        this.killBlock(this.runningSubprocesses);
    }
    /**
     * Kills the code block.
     * To be overwritten in an executor's run method
     */
    killBlock(subprocesses) { }
    /**
     * Hides the output and clears the log. Visually, restores the code block to its initial state.
     */
    delete() {
        if (this.outputElement)
            this.outputElement.style.display = "none";
        this.clear();
    }
    /**
     * Add a segment of stdout data to the outputter
     * @param text The stdout data in question
     */
    write(text) {
        this.processSigilsAndWriteText(text);
    }
    /**
     * Add an icon to the outputter.
     * @param icon Name of the icon from the lucide library {@link https://lucide.dev/}
     * @param hoverTooltip Title to display on mouseover
     * @param styleClass CSS class for design tweaks
     * @returns HTMLAnchorElement to add a click listener, for instance
     */
    writeIcon(icon, hoverTooltip, styleClass) {
        const button = this.lastPrintElem.createEl('a', { title: hoverTooltip, cls: styleClass });
        setIcon(button, icon);
        return button;
    }
    /**
     * Add a segment of rendered markdown to the outputter
     * @param markdown The Markdown source code to be rendered as HTML
     * @param addLineBreak whether to start a new line in stdout afterwards
     * @param relativeFile Path of the markdown file. Used to resolve relative internal links.
     */
    async writeMarkdown(markdown, addLineBreak, relativeFile = this.srcFile) {
        if (relativeFile !== this.srcFile) {
            relativeFile = normalizePath(relativeFile);
        }
        const renderedEl = document.createElement("div");
        await MarkdownRenderer.render(this.app, markdown, renderedEl, relativeFile, new Component());
        for (const child of Array.from(renderedEl.children)) {
            this.write(TOGGLE_HTML_SIGIL + child.innerHTML + TOGGLE_HTML_SIGIL);
        }
        if (addLineBreak)
            this.write(`\n`);
    }
    /**
     * Add a segment of stdout data to the outputter,
     * processing `toggleHtmlSigil`s along the way.
     * `toggleHtmlSigil`s may be interleaved with text and HTML
     * in any way; this method will correctly interpret them.
     * @param text The stdout data in question
     */
    processSigilsAndWriteText(text) {
        //Loop around, removing HTML toggling sigils
        while (true) {
            let index = text.indexOf(TOGGLE_HTML_SIGIL);
            if (index === -1)
                break;
            if (index > 0)
                this.writeRaw(text.substring(0, index));
            this.escapeHTML = !this.escapeHTML;
            this.writeHTMLBuffer(this.addStdout());
            text = text.substring(index + TOGGLE_HTML_SIGIL.length);
        }
        this.writeRaw(text);
    }
    /**
     * Writes a segment of stdout data without caring about the HTML sigil
     * @param text The stdout data in question
     */
    writeRaw(text) {
        //remove ANSI escape codes
        text = text.replace(/\x1b\\[;\d]*m/g, "");
        // Keep output field and clear button invisible if no text was printed.
        if (this.textPrinted(text)) {
            // make visible again:
            this.makeOutputVisible();
        }
        this.escapeAwareAppend(this.addStdout(), text);
    }
    /**
     * Add a segment of stderr data to the outputter
     * @param text The stderr data in question
     */
    writeErr(text) {
        //remove ANSI escape codes
        text = text.replace(/\x1b\\[;\d]*m/g, "");
        // Keep output field and clear button invisible if no text was printed.
        if (this.textPrinted(text)) {
            // make visible again:
            this.makeOutputVisible();
        }
        this.addStderr().appendText(text);
    }
    /**
     * Hide the input element. Stop accepting input from the user.
     */
    closeInput() {
        this.inputState = "CLOSED";
        if (this.inputElement)
            this.inputElement.style.display = "none";
    }
    /**
     * Mark the block as running
     */
    startBlock() {
        if (!this.loadStateIndicatorElement)
            this.addLoadStateIndicator();
        setTimeout(() => {
            if (this.blockRunState !== "FINISHED")
                this.loadStateIndicatorElement.classList.add("visible");
        }, 100);
        this.loadStateIndicatorElement.empty();
        this.loadStateIndicatorElement.appendChild(loadSpinner());
        this.loadStateIndicatorElement.setAttribute("aria-label", "This block is running.\nClick to stop.");
        this.blockRunState = "RUNNING";
    }
    /**
     * Marks the block as queued, but waiting for another block before running
     */
    queueBlock() {
        if (!this.loadStateIndicatorElement)
            this.addLoadStateIndicator();
        setTimeout(() => {
            if (this.blockRunState !== "FINISHED")
                this.loadStateIndicatorElement.classList.add("visible");
        }, 100);
        this.loadStateIndicatorElement.empty();
        this.loadStateIndicatorElement.appendChild(loadEllipses());
        this.loadStateIndicatorElement.setAttribute("aria-label", "This block is waiting for another block to finish.\nClick to cancel.");
        this.blockRunState = "QUEUED";
    }
    /** Marks the block as finished running */
    finishBlock() {
        if (this.loadStateIndicatorElement) {
            this.loadStateIndicatorElement.classList.remove("visible");
        }
        this.blockRunState = "FINISHED";
    }
    addLoadStateIndicator() {
        this.loadStateIndicatorElement = document.createElement("div");
        this.loadStateIndicatorElement.classList.add("load-state-indicator");
        // Kill code block on clicking load state indicator
        this.loadStateIndicatorElement.addEventListener('click', () => this.killBlock(this.runningSubprocesses));
        this.getParentElement().parentElement.appendChild(this.loadStateIndicatorElement);
    }
    getParentElement() {
        return this.codeBlockElement.parentElement;
    }
    addClearButton() {
        const parentEl = this.getParentElement();
        this.clearButton = document.createElement("button");
        this.clearButton.className = "clear-button";
        this.clearButton.setText("Clear");
        this.clearButton.addEventListener("click", () => this.delete());
        parentEl.appendChild(this.clearButton);
    }
    addOutputElement() {
        const parentEl = this.getParentElement();
        const hr = document.createElement("hr");
        this.outputElement = document.createElement("code");
        this.outputElement.classList.add("language-output");
        // TODO: Additionally include class executor-output?
        // this.outputElement.classList.add("executor-output");
        this.outputElement.appendChild(hr);
        if (this.inputState != "NOT_DOING")
            this.addInputElement();
        parentEl.appendChild(this.outputElement);
    }
    /**
     * Add an interactive input element to the outputter
     */
    addInputElement() {
        this.inputElement = document.createElement("input");
        this.inputElement.classList.add("interactive-stdin");
        this.inputElement.addEventListener("keypress", (e) => {
            if (e.key == "Enter") {
                this.processInput(this.inputElement.value + "\n");
                this.inputElement.value = "";
            }
        });
        this.outputElement.appendChild(this.inputElement);
    }
    /**
     * Ensure that input from a user gets echoed to the outputter before being emitted to event subscribers.
     *
     * @param input a line of input from the user. In most applications, should end with a newline.
     */
    processInput(input) {
        this.addStdin().appendText(input);
        this.emit("data", input);
    }
    addStdin() {
        return this.addStreamSegmentElement("stdin");
    }
    addStderr() {
        return this.addStreamSegmentElement("stderr");
    }
    addStdout() {
        return this.addStreamSegmentElement("stdout");
    }
    /**
     * Creates a wrapper element for a segment of a standard stream.
     * In order to intermingle the streams as they are output to, segments
     * are more effective than one-element-for-each.
     *
     * If the last segment was of the same stream, it will be returned instead.
     *
     * @param streamId The standard stream's name (stderr, stdout, or stdin)
     * @returns the wrapper `span` element
     */
    addStreamSegmentElement(streamId) {
        if (!this.outputElement)
            this.addOutputElement();
        if (this.lastPrintElem)
            if (this.lastPrintElem.classList.contains(streamId))
                return this.lastPrintElem;
        const stdElem = document.createElement("span");
        stdElem.addClass(streamId);
        if (this.inputElement) {
            this.outputElement.insertBefore(stdElem, this.inputElement);
        }
        else {
            this.outputElement.appendChild(stdElem);
        }
        this.lastPrintElem = stdElem;
        return stdElem;
    }
    /**
     * Appends some text to a given element. Respects `this.escapeHTML` for whether or not to escape HTML.
     * If not escaping HTML, appends the text to the HTML buffer to ensure that the whole HTML segment is recieved
     * before parsing it.
     * @param element Element to append to
     * @param text text to append
     */
    escapeAwareAppend(element, text) {
        if (this.escapeHTML) {
            // If we're escaping HTML, just append the text
            element.appendChild(document.createTextNode(text));
            if (this.settings.persistentOuput) {
                // Also append to file in separate code block
                this.saveToFile.addOutput(text);
            }
        }
        else {
            this.htmlBuffer += text;
        }
    }
    /**
     * Parses the HTML buffer and appends its elements to a given parent element.
     * Erases the HTML buffer afterwards.
     * @param element element to append to
     */
    writeHTMLBuffer(element) {
        if (this.htmlBuffer !== "") {
            this.makeOutputVisible();
            const packet = this.parsePacket(this.htmlBuffer);
            const content = document.createElement("div");
            content.innerHTML = packet.action;
            for (const childElem of Array.from(content.childNodes))
                element.appendChild(childElem);
            // TODO: Include to file output,
            // this.saveToFile.addOutput(this.htmlBuffer);
            this.htmlBuffer = "";
        }
    }
    parsePacket(buffer) {
        const [action, data, optionsStr] = buffer.split(SEPARATOR);
        if (!action)
            throw `Invalid packet: ${buffer}.`;
        let options;
        if (!optionsStr)
            return { action, data, options };
        try {
            options = JSON.parse(optionsStr);
        }
        catch (e) {
            throw new Error(`Failed to parse options JSON: ${e.message}`);
        }
        return { action, data, options };
    }
    /**
     * Checks if either:
     * - this outputter has printed something before.
     * - the given `text` is non-empty.
     * If `text` is non-empty, this function will assume that it gets printed later.
     *
     * @param text Text which is to be printed
     * @returns Whether text has been printed or will be printed
     */
    textPrinted(text) {
        if (this.hadPreviouslyPrinted)
            return true;
        if (text.contains(TOGGLE_HTML_SIGIL))
            return false;
        if (text === "")
            return false;
        this.hadPreviouslyPrinted = true;
        return true;
    }
    /**
     * Restores output elements after the outputter has been `delete()`d or `clear()`d.
     * @see {@link delete()}
     * @see {@link clear()}
     */
    makeOutputVisible() {
        this.closeInput();
        if (!this.clearButton)
            this.addClearButton();
        if (!this.outputElement)
            this.addOutputElement();
        this.inputState = "OPEN";
        this.outputElement.style.display = "block";
        this.clearButton.className = "clear-button";
        setTimeout(() => {
            if (this.inputState === "OPEN")
                this.inputElement.style.display = "inline";
        }, 1000);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3V0cHV0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3V0cHV0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDdEMsT0FBTyxZQUFZLE1BQU0sc0JBQXNCLENBQUM7QUFDaEQsT0FBTyxXQUFXLE1BQU0scUJBQXFCLENBQUM7QUFDOUMsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxFQUFPLFNBQVMsRUFBRSxnQkFBZ0IsRUFBZ0IsYUFBYSxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUlsRyxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDMUYsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUM7QUFRcEMsTUFBTSxPQUFPLFNBQVUsU0FBUSxZQUFZO0lBMEIxQyxZQUFZLFNBQXNCLEVBQUUsUUFBMEIsRUFBRSxJQUFrQixFQUFFLEdBQVEsRUFBRSxPQUFlO1FBQzVHLEtBQUssRUFBRSxDQUFDO1FBTFQsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFNN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUN0RSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7UUFFL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLGFBQStCLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1RCxJQUFJLEtBQUssWUFBWSxlQUFlO29CQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN2QztTQUNEO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDMUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztRQUNsQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUV0QixJQUFJLElBQUksQ0FBQyxXQUFXO1lBQ25CLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDO1FBRXRELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3Qiw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU5QixrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxDQUFDLFlBQWdDLElBQUksQ0FBQztJQUUvQzs7T0FFRztJQUNILE1BQU07UUFDTCxJQUFJLElBQUksQ0FBQyxhQUFhO1lBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFM0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ2IsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxJQUFZO1FBQ2pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV0QyxDQUFDO0lBR0Q7Ozs7OztPQU1HO0lBQ0gsU0FBUyxDQUFDLElBQVksRUFBRSxZQUFxQixFQUFFLFVBQThCO1FBQzVFLE1BQU0sTUFBTSxHQUFzQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzdHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEIsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQWdCLEVBQUUsWUFBc0IsRUFBRSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU87UUFDeEYsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNsQyxZQUFZLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRCxNQUFNLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQztRQUM3RixLQUFLLE1BQU0sS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3BFO1FBQ0QsSUFBSSxZQUFZO1lBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0sseUJBQXlCLENBQUMsSUFBWTtRQUM3Qyw0Q0FBNEM7UUFDNUMsT0FBTyxJQUFJLEVBQUU7WUFDWixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDNUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUFFLE1BQU07WUFFeEIsSUFBSSxLQUFLLEdBQUcsQ0FBQztnQkFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFdkQsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUV2QyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEQ7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7O09BR0c7SUFDSyxRQUFRLENBQUMsSUFBWTtRQUM1QiwwQkFBMEI7UUFDMUIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFekMsdUVBQXVFO1FBQ3ZFLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUUzQixzQkFBc0I7WUFDdEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDekI7UUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRLENBQUMsSUFBWTtRQUNwQiwwQkFBMEI7UUFDMUIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFekMsdUVBQXVFO1FBQ3ZFLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzQixzQkFBc0I7WUFDdEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7U0FDeEI7UUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRW5DLENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVU7UUFDVCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUMzQixJQUFJLElBQUksQ0FBQyxZQUFZO1lBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDM0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsVUFBVTtRQUNULElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCO1lBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDbEUsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNmLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxVQUFVO2dCQUNwQyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFHUixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLHdDQUF3QyxDQUFDLENBQUM7UUFFcEcsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsVUFBVTtRQUNULElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCO1lBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDbEUsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNmLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxVQUFVO2dCQUNwQyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFUixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBRTNELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLHNFQUFzRSxDQUFDLENBQUM7UUFFbEksSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7SUFDL0IsQ0FBQztJQUVELDBDQUEwQztJQUMxQyxXQUFXO1FBQ1YsSUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUU7WUFDbkMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0Q7UUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBRU8scUJBQXFCO1FBQzVCLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRS9ELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFckUsbURBQW1EO1FBQ25ELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBRXpHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVPLGdCQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUErQixDQUFDO0lBQzlELENBQUM7SUFFTyxjQUFjO1FBQ3JCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXpDLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7UUFDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFaEUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVPLGdCQUFnQjtRQUN2QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV6QyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUVwRCxvREFBb0Q7UUFDcEQsdURBQXVEO1FBRXZELElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxXQUFXO1lBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNELFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7T0FFRztJQUNLLGVBQWU7UUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDcEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLE9BQU8sRUFBRTtnQkFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQzdCO1FBQ0YsQ0FBQyxDQUFDLENBQUE7UUFHRixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxZQUFZLENBQUMsS0FBYTtRQUNqQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWxDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFTyxRQUFRO1FBQ2YsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVPLFNBQVM7UUFDaEIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVPLFNBQVM7UUFDaEIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNLLHVCQUF1QixDQUFDLFFBQXVDO1FBQ3RFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYTtZQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRWpELElBQUksSUFBSSxDQUFDLGFBQWE7WUFDckIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2dCQUFFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUVoRixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFM0IsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDNUQ7YUFBTTtZQUNOLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUM7UUFFN0IsT0FBTyxPQUFPLENBQUE7SUFDZixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssaUJBQWlCLENBQUMsT0FBb0IsRUFBRSxJQUFZO1FBQzNELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQiwrQ0FBK0M7WUFDL0MsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFbkQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRTtnQkFDbEMsNkNBQTZDO2dCQUM3QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNoQztTQUVEO2FBQU07WUFDTixJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztTQUN4QjtJQUNGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssZUFBZSxDQUFDLE9BQW9CO1FBQzNDLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFekIsTUFBTSxNQUFNLEdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFekQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbEMsS0FBSyxNQUFNLFNBQVMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7Z0JBQ3JELE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFaEMsZ0NBQWdDO1lBQ2hDLDhDQUE4QztZQUU5QyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztTQUNyQjtJQUNGLENBQUM7SUFFTyxXQUFXLENBQUMsTUFBYztRQUNqQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTNELElBQUksQ0FBQyxNQUFNO1lBQUUsTUFBTSxtQkFBbUIsTUFBTSxHQUFHLENBQUM7UUFFaEQsSUFBSSxPQUE0QyxDQUFDO1FBQ2pELElBQUksQ0FBQyxVQUFVO1lBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFFbEQsSUFBSTtZQUNILE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2pDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDWCxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFrQyxDQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUN6RTtRQUNELE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNLLFdBQVcsQ0FBQyxJQUFZO1FBQy9CLElBQUksSUFBSSxDQUFDLG9CQUFvQjtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRTNDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ25ELElBQUksSUFBSSxLQUFLLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUU5QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxpQkFBaUI7UUFDeEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztZQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWE7WUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUVqRCxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUN6QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztRQUU1QyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2YsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLE1BQU07Z0JBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUM1RSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDVCxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiZXZlbnRzXCI7XHJcbmltcG9ydCBsb2FkRWxsaXBzZXMgZnJvbSBcIi4uL3N2Z3MvbG9hZEVsbGlwc2VzXCI7XHJcbmltcG9ydCBsb2FkU3Bpbm5lciBmcm9tIFwiLi4vc3Zncy9sb2FkU3Bpbm5lclwiO1xyXG5pbXBvcnQgRmlsZUFwcGVuZGVyIGZyb20gXCIuL0ZpbGVBcHBlbmRlclwiO1xyXG5pbXBvcnQgeyBBcHAsIENvbXBvbmVudCwgTWFya2Rvd25SZW5kZXJlciwgTWFya2Rvd25WaWV3LCBub3JtYWxpemVQYXRoLCBzZXRJY29uIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCB7IEV4ZWN1dG9yU2V0dGluZ3MgfSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ3NcIjtcclxuaW1wb3J0IHsgQ2hpbGRQcm9jZXNzIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBUT0dHTEVfSFRNTF9TSUdJTCA9IGBUT0dHTEVfSFRNTF8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygyKX1gO1xyXG5jb25zdCBTRVBBUkFUT1IgPSAnPElQQ19TRVBFUkFUT1I+JztcclxuXHJcbmludGVyZmFjZSBQYWNrZXQge1xyXG5cdGFjdGlvbjogc3RyaW5nO1xyXG5cdGRhdGE6IHN0cmluZztcclxuXHRvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT3V0cHV0dGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb2RlQmxvY2tFbGVtZW50OiBIVE1MRWxlbWVudDtcclxuXHRvdXRwdXRFbGVtZW50OiBIVE1MRWxlbWVudDtcclxuXHRjbGVhckJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcblx0bGFzdFByaW50RWxlbTogSFRNTFNwYW5FbGVtZW50O1xyXG5cdGxhc3RQcmludGVkOiBzdHJpbmc7XHJcblxyXG5cdGlucHV0RWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcclxuXHJcblx0bG9hZFN0YXRlSW5kaWNhdG9yRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcblxyXG5cdGh0bWxCdWZmZXI6IHN0cmluZ1xyXG5cdGVzY2FwZUhUTUw6IGJvb2xlYW5cclxuXHRoYWRQcmV2aW91c2x5UHJpbnRlZDogYm9vbGVhbjtcclxuXHRpbnB1dFN0YXRlOiBcIk5PVF9ET0lOR1wiIHwgXCJPUEVOXCIgfCBcIkNMT1NFRFwiIHwgXCJJTkFDVElWRVwiO1xyXG5cclxuXHRibG9ja1J1blN0YXRlOiBcIlJVTk5JTkdcIiB8IFwiUVVFVUVEXCIgfCBcIkZJTklTSEVEXCIgfCBcIklOSVRJQUxcIjtcclxuXHJcblx0c2F2ZVRvRmlsZTogRmlsZUFwcGVuZGVyO1xyXG5cdHNldHRpbmdzOiBFeGVjdXRvclNldHRpbmdzO1xyXG5cclxuXHJcblx0cnVubmluZ1N1YnByb2Nlc3NlcyA9IG5ldyBTZXQ8Q2hpbGRQcm9jZXNzPigpO1xyXG5cdGFwcDogQXBwO1xyXG5cdHNyY0ZpbGU6IHN0cmluZztcclxuXHJcblx0Y29uc3RydWN0b3IoY29kZUJsb2NrOiBIVE1MRWxlbWVudCwgc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MsIHZpZXc6IE1hcmtkb3duVmlldywgYXBwOiBBcHAsIHNyY0ZpbGU6IHN0cmluZykge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuXHRcdHRoaXMuYXBwID0gYXBwO1xyXG5cdFx0dGhpcy5zcmNGaWxlID0gc3JjRmlsZTtcclxuXHJcblx0XHR0aGlzLmlucHV0U3RhdGUgPSB0aGlzLnNldHRpbmdzLmFsbG93SW5wdXQgPyBcIklOQUNUSVZFXCIgOiBcIk5PVF9ET0lOR1wiO1xyXG5cdFx0dGhpcy5jb2RlQmxvY2tFbGVtZW50ID0gY29kZUJsb2NrO1xyXG5cdFx0dGhpcy5oYWRQcmV2aW91c2x5UHJpbnRlZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5lc2NhcGVIVE1MID0gdHJ1ZTtcclxuXHRcdHRoaXMuaHRtbEJ1ZmZlciA9IFwiXCI7XHJcblx0XHR0aGlzLmJsb2NrUnVuU3RhdGUgPSBcIklOSVRJQUxcIjtcclxuXHJcblx0XHR0aGlzLnNhdmVUb0ZpbGUgPSBuZXcgRmlsZUFwcGVuZGVyKHZpZXcsIGNvZGVCbG9jay5wYXJlbnRFbGVtZW50IGFzIEhUTUxQcmVFbGVtZW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsZWFycyB0aGUgb3V0cHV0IGxvZy5cclxuXHQgKi9cclxuXHRjbGVhcigpIHtcclxuXHRcdGlmICh0aGlzLm91dHB1dEVsZW1lbnQpIHtcclxuXHRcdFx0Zm9yIChjb25zdCBjaGlsZCBvZiBBcnJheS5mcm9tKHRoaXMub3V0cHV0RWxlbWVudC5jaGlsZHJlbikpIHtcclxuXHRcdFx0XHRpZiAoY2hpbGQgaW5zdGFuY2VvZiBIVE1MU3BhbkVsZW1lbnQpXHJcblx0XHRcdFx0XHR0aGlzLm91dHB1dEVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR0aGlzLmxhc3RQcmludEVsZW0gPSBudWxsO1xyXG5cdFx0dGhpcy5oYWRQcmV2aW91c2x5UHJpbnRlZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5sYXN0UHJpbnRlZCA9IFwiXCI7XHJcblxyXG5cdFx0aWYgKHRoaXMuY2xlYXJCdXR0b24pXHJcblx0XHRcdHRoaXMuY2xlYXJCdXR0b24uY2xhc3NOYW1lID0gXCJjbGVhci1idXR0b24tZGlzYWJsZWRcIjtcclxuXHJcblx0XHR0aGlzLmNsb3NlSW5wdXQoKTtcclxuXHRcdHRoaXMuaW5wdXRTdGF0ZSA9IFwiSU5BQ1RJVkVcIjtcclxuXHJcblx0XHQvLyBjbGVhciBvdXRwdXQgYmxvY2sgaW4gZmlsZVxyXG5cdFx0dGhpcy5zYXZlVG9GaWxlLmNsZWFyT3V0cHV0KCk7XHJcblxyXG5cdFx0Ly8gS2lsbCBjb2RlIGJsb2NrXHJcblx0XHR0aGlzLmtpbGxCbG9jayh0aGlzLnJ1bm5pbmdTdWJwcm9jZXNzZXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogS2lsbHMgdGhlIGNvZGUgYmxvY2suXHJcblx0ICogVG8gYmUgb3ZlcndyaXR0ZW4gaW4gYW4gZXhlY3V0b3IncyBydW4gbWV0aG9kXHJcblx0ICovXHJcblx0a2lsbEJsb2NrKHN1YnByb2Nlc3Nlcz86IFNldDxDaGlsZFByb2Nlc3M+KSB7IH1cclxuXHJcblx0LyoqXHJcblx0ICogSGlkZXMgdGhlIG91dHB1dCBhbmQgY2xlYXJzIHRoZSBsb2cuIFZpc3VhbGx5LCByZXN0b3JlcyB0aGUgY29kZSBibG9jayB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cclxuXHQgKi9cclxuXHRkZWxldGUoKSB7XHJcblx0XHRpZiAodGhpcy5vdXRwdXRFbGVtZW50KVxyXG5cdFx0XHR0aGlzLm91dHB1dEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuXHRcdHRoaXMuY2xlYXIoKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgc2VnbWVudCBvZiBzdGRvdXQgZGF0YSB0byB0aGUgb3V0cHV0dGVyXHJcblx0ICogQHBhcmFtIHRleHQgVGhlIHN0ZG91dCBkYXRhIGluIHF1ZXN0aW9uXHJcblx0ICovXHJcblx0d3JpdGUodGV4dDogc3RyaW5nKSB7XHJcblx0XHR0aGlzLnByb2Nlc3NTaWdpbHNBbmRXcml0ZVRleHQodGV4dCk7XHJcblxyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBpY29uIHRvIHRoZSBvdXRwdXR0ZXIuXHJcblx0ICogQHBhcmFtIGljb24gTmFtZSBvZiB0aGUgaWNvbiBmcm9tIHRoZSBsdWNpZGUgbGlicmFyeSB7QGxpbmsgaHR0cHM6Ly9sdWNpZGUuZGV2L31cclxuXHQgKiBAcGFyYW0gaG92ZXJUb29sdGlwIFRpdGxlIHRvIGRpc3BsYXkgb24gbW91c2VvdmVyXHJcblx0ICogQHBhcmFtIHN0eWxlQ2xhc3MgQ1NTIGNsYXNzIGZvciBkZXNpZ24gdHdlYWtzXHJcblx0ICogQHJldHVybnMgSFRNTEFuY2hvckVsZW1lbnQgdG8gYWRkIGEgY2xpY2sgbGlzdGVuZXIsIGZvciBpbnN0YW5jZVxyXG5cdCAqL1xyXG5cdHdyaXRlSWNvbihpY29uOiBzdHJpbmcsIGhvdmVyVG9vbHRpcD86IHN0cmluZywgc3R5bGVDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdKTogSFRNTEFuY2hvckVsZW1lbnQge1xyXG5cdFx0Y29uc3QgYnV0dG9uOiBIVE1MQW5jaG9yRWxlbWVudCA9IHRoaXMubGFzdFByaW50RWxlbS5jcmVhdGVFbCgnYScsIHsgdGl0bGU6IGhvdmVyVG9vbHRpcCwgY2xzOiBzdHlsZUNsYXNzIH0pO1xyXG5cdFx0c2V0SWNvbihidXR0b24sIGljb24pO1xyXG5cdFx0cmV0dXJuIGJ1dHRvbjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhIHNlZ21lbnQgb2YgcmVuZGVyZWQgbWFya2Rvd24gdG8gdGhlIG91dHB1dHRlclxyXG5cdCAqIEBwYXJhbSBtYXJrZG93biBUaGUgTWFya2Rvd24gc291cmNlIGNvZGUgdG8gYmUgcmVuZGVyZWQgYXMgSFRNTFxyXG5cdCAqIEBwYXJhbSBhZGRMaW5lQnJlYWsgd2hldGhlciB0byBzdGFydCBhIG5ldyBsaW5lIGluIHN0ZG91dCBhZnRlcndhcmRzXHJcblx0ICogQHBhcmFtIHJlbGF0aXZlRmlsZSBQYXRoIG9mIHRoZSBtYXJrZG93biBmaWxlLiBVc2VkIHRvIHJlc29sdmUgcmVsYXRpdmUgaW50ZXJuYWwgbGlua3MuXHJcblx0ICovXHJcblx0YXN5bmMgd3JpdGVNYXJrZG93bihtYXJrZG93bjogc3RyaW5nLCBhZGRMaW5lQnJlYWs/OiBib29sZWFuLCByZWxhdGl2ZUZpbGUgPSB0aGlzLnNyY0ZpbGUpIHtcclxuXHRcdGlmIChyZWxhdGl2ZUZpbGUgIT09IHRoaXMuc3JjRmlsZSkge1xyXG5cdFx0XHRyZWxhdGl2ZUZpbGUgPSBub3JtYWxpemVQYXRoKHJlbGF0aXZlRmlsZSk7XHJcblx0XHR9XHJcblx0XHRjb25zdCByZW5kZXJlZEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdGF3YWl0IE1hcmtkb3duUmVuZGVyZXIucmVuZGVyKHRoaXMuYXBwLCBtYXJrZG93biwgcmVuZGVyZWRFbCwgcmVsYXRpdmVGaWxlLCBuZXcgQ29tcG9uZW50KCkpO1xyXG5cdFx0Zm9yIChjb25zdCBjaGlsZCBvZiBBcnJheS5mcm9tKHJlbmRlcmVkRWwuY2hpbGRyZW4pKSB7XHJcblx0XHRcdHRoaXMud3JpdGUoVE9HR0xFX0hUTUxfU0lHSUwgKyBjaGlsZC5pbm5lckhUTUwgKyBUT0dHTEVfSFRNTF9TSUdJTCk7XHJcblx0XHR9XHJcblx0XHRpZiAoYWRkTGluZUJyZWFrKSB0aGlzLndyaXRlKGBcXG5gKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhIHNlZ21lbnQgb2Ygc3Rkb3V0IGRhdGEgdG8gdGhlIG91dHB1dHRlcixcclxuXHQgKiBwcm9jZXNzaW5nIGB0b2dnbGVIdG1sU2lnaWxgcyBhbG9uZyB0aGUgd2F5LlxyXG5cdCAqIGB0b2dnbGVIdG1sU2lnaWxgcyBtYXkgYmUgaW50ZXJsZWF2ZWQgd2l0aCB0ZXh0IGFuZCBIVE1MXHJcblx0ICogaW4gYW55IHdheTsgdGhpcyBtZXRob2Qgd2lsbCBjb3JyZWN0bHkgaW50ZXJwcmV0IHRoZW0uXHJcblx0ICogQHBhcmFtIHRleHQgVGhlIHN0ZG91dCBkYXRhIGluIHF1ZXN0aW9uXHJcblx0ICovXHJcblx0cHJpdmF0ZSBwcm9jZXNzU2lnaWxzQW5kV3JpdGVUZXh0KHRleHQ6IHN0cmluZykge1xyXG5cdFx0Ly9Mb29wIGFyb3VuZCwgcmVtb3ZpbmcgSFRNTCB0b2dnbGluZyBzaWdpbHNcclxuXHRcdHdoaWxlICh0cnVlKSB7XHJcblx0XHRcdGxldCBpbmRleCA9IHRleHQuaW5kZXhPZihUT0dHTEVfSFRNTF9TSUdJTCk7XHJcblx0XHRcdGlmIChpbmRleCA9PT0gLTEpIGJyZWFrO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4ID4gMCkgdGhpcy53cml0ZVJhdyh0ZXh0LnN1YnN0cmluZygwLCBpbmRleCkpO1xyXG5cclxuXHRcdFx0dGhpcy5lc2NhcGVIVE1MID0gIXRoaXMuZXNjYXBlSFRNTDtcclxuXHRcdFx0dGhpcy53cml0ZUhUTUxCdWZmZXIodGhpcy5hZGRTdGRvdXQoKSk7XHJcblxyXG5cdFx0XHR0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoaW5kZXggKyBUT0dHTEVfSFRNTF9TSUdJTC5sZW5ndGgpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy53cml0ZVJhdyh0ZXh0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlcyBhIHNlZ21lbnQgb2Ygc3Rkb3V0IGRhdGEgd2l0aG91dCBjYXJpbmcgYWJvdXQgdGhlIEhUTUwgc2lnaWxcclxuXHQgKiBAcGFyYW0gdGV4dCBUaGUgc3Rkb3V0IGRhdGEgaW4gcXVlc3Rpb25cclxuXHQgKi9cclxuXHRwcml2YXRlIHdyaXRlUmF3KHRleHQ6IHN0cmluZykge1xyXG5cdFx0Ly9yZW1vdmUgQU5TSSBlc2NhcGUgY29kZXNcclxuXHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xceDFiXFxcXFs7XFxkXSptL2csIFwiXCIpXHJcblxyXG5cdFx0Ly8gS2VlcCBvdXRwdXQgZmllbGQgYW5kIGNsZWFyIGJ1dHRvbiBpbnZpc2libGUgaWYgbm8gdGV4dCB3YXMgcHJpbnRlZC5cclxuXHRcdGlmICh0aGlzLnRleHRQcmludGVkKHRleHQpKSB7XHJcblxyXG5cdFx0XHQvLyBtYWtlIHZpc2libGUgYWdhaW46XHJcblx0XHRcdHRoaXMubWFrZU91dHB1dFZpc2libGUoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmVzY2FwZUF3YXJlQXBwZW5kKHRoaXMuYWRkU3Rkb3V0KCksIHRleHQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgc2VnbWVudCBvZiBzdGRlcnIgZGF0YSB0byB0aGUgb3V0cHV0dGVyXHJcblx0ICogQHBhcmFtIHRleHQgVGhlIHN0ZGVyciBkYXRhIGluIHF1ZXN0aW9uXHJcblx0ICovXHJcblx0d3JpdGVFcnIodGV4dDogc3RyaW5nKSB7XHJcblx0XHQvL3JlbW92ZSBBTlNJIGVzY2FwZSBjb2Rlc1xyXG5cdFx0dGV4dCA9IHRleHQucmVwbGFjZSgvXFx4MWJcXFxcWztcXGRdKm0vZywgXCJcIilcclxuXHJcblx0XHQvLyBLZWVwIG91dHB1dCBmaWVsZCBhbmQgY2xlYXIgYnV0dG9uIGludmlzaWJsZSBpZiBubyB0ZXh0IHdhcyBwcmludGVkLlxyXG5cdFx0aWYgKHRoaXMudGV4dFByaW50ZWQodGV4dCkpIHtcclxuXHRcdFx0Ly8gbWFrZSB2aXNpYmxlIGFnYWluOlxyXG5cdFx0XHR0aGlzLm1ha2VPdXRwdXRWaXNpYmxlKClcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFkZFN0ZGVycigpLmFwcGVuZFRleHQodGV4dCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGlkZSB0aGUgaW5wdXQgZWxlbWVudC4gU3RvcCBhY2NlcHRpbmcgaW5wdXQgZnJvbSB0aGUgdXNlci5cclxuXHQgKi9cclxuXHRjbG9zZUlucHV0KCkge1xyXG5cdFx0dGhpcy5pbnB1dFN0YXRlID0gXCJDTE9TRURcIjtcclxuXHRcdGlmICh0aGlzLmlucHV0RWxlbWVudClcclxuXHRcdFx0dGhpcy5pbnB1dEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWFyayB0aGUgYmxvY2sgYXMgcnVubmluZ1xyXG5cdCAqL1xyXG5cdHN0YXJ0QmxvY2soKSB7XHJcblx0XHRpZiAoIXRoaXMubG9hZFN0YXRlSW5kaWNhdG9yRWxlbWVudCkgdGhpcy5hZGRMb2FkU3RhdGVJbmRpY2F0b3IoKTtcclxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRpZiAodGhpcy5ibG9ja1J1blN0YXRlICE9PSBcIkZJTklTSEVEXCIpXHJcblx0XHRcdFx0dGhpcy5sb2FkU3RhdGVJbmRpY2F0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xyXG5cdFx0fSwgMTAwKTtcclxuXHJcblxyXG5cdFx0dGhpcy5sb2FkU3RhdGVJbmRpY2F0b3JFbGVtZW50LmVtcHR5KCk7XHJcblx0XHR0aGlzLmxvYWRTdGF0ZUluZGljYXRvckVsZW1lbnQuYXBwZW5kQ2hpbGQobG9hZFNwaW5uZXIoKSk7XHJcblxyXG5cdFx0dGhpcy5sb2FkU3RhdGVJbmRpY2F0b3JFbGVtZW50LnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgXCJUaGlzIGJsb2NrIGlzIHJ1bm5pbmcuXFxuQ2xpY2sgdG8gc3RvcC5cIik7XHJcblxyXG5cdFx0dGhpcy5ibG9ja1J1blN0YXRlID0gXCJSVU5OSU5HXCI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYXJrcyB0aGUgYmxvY2sgYXMgcXVldWVkLCBidXQgd2FpdGluZyBmb3IgYW5vdGhlciBibG9jayBiZWZvcmUgcnVubmluZ1xyXG5cdCAqL1xyXG5cdHF1ZXVlQmxvY2soKSB7XHJcblx0XHRpZiAoIXRoaXMubG9hZFN0YXRlSW5kaWNhdG9yRWxlbWVudCkgdGhpcy5hZGRMb2FkU3RhdGVJbmRpY2F0b3IoKTtcclxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRpZiAodGhpcy5ibG9ja1J1blN0YXRlICE9PSBcIkZJTklTSEVEXCIpXHJcblx0XHRcdFx0dGhpcy5sb2FkU3RhdGVJbmRpY2F0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xyXG5cdFx0fSwgMTAwKTtcclxuXHJcblx0XHR0aGlzLmxvYWRTdGF0ZUluZGljYXRvckVsZW1lbnQuZW1wdHkoKTtcclxuXHRcdHRoaXMubG9hZFN0YXRlSW5kaWNhdG9yRWxlbWVudC5hcHBlbmRDaGlsZChsb2FkRWxsaXBzZXMoKSk7XHJcblxyXG5cdFx0dGhpcy5sb2FkU3RhdGVJbmRpY2F0b3JFbGVtZW50LnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgXCJUaGlzIGJsb2NrIGlzIHdhaXRpbmcgZm9yIGFub3RoZXIgYmxvY2sgdG8gZmluaXNoLlxcbkNsaWNrIHRvIGNhbmNlbC5cIik7XHJcblxyXG5cdFx0dGhpcy5ibG9ja1J1blN0YXRlID0gXCJRVUVVRURcIjtcclxuXHR9XHJcblxyXG5cdC8qKiBNYXJrcyB0aGUgYmxvY2sgYXMgZmluaXNoZWQgcnVubmluZyAqL1xyXG5cdGZpbmlzaEJsb2NrKCkge1xyXG5cdFx0aWYgKHRoaXMubG9hZFN0YXRlSW5kaWNhdG9yRWxlbWVudCkge1xyXG5cdFx0XHR0aGlzLmxvYWRTdGF0ZUluZGljYXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInZpc2libGVcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5ibG9ja1J1blN0YXRlID0gXCJGSU5JU0hFRFwiO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhZGRMb2FkU3RhdGVJbmRpY2F0b3IoKSB7XHJcblx0XHR0aGlzLmxvYWRTdGF0ZUluZGljYXRvckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cclxuXHRcdHRoaXMubG9hZFN0YXRlSW5kaWNhdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibG9hZC1zdGF0ZS1pbmRpY2F0b3JcIik7XHJcblxyXG5cdFx0Ly8gS2lsbCBjb2RlIGJsb2NrIG9uIGNsaWNraW5nIGxvYWQgc3RhdGUgaW5kaWNhdG9yXHJcblx0XHR0aGlzLmxvYWRTdGF0ZUluZGljYXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmtpbGxCbG9jayh0aGlzLnJ1bm5pbmdTdWJwcm9jZXNzZXMpKTtcclxuXHJcblx0XHR0aGlzLmdldFBhcmVudEVsZW1lbnQoKS5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMubG9hZFN0YXRlSW5kaWNhdG9yRWxlbWVudCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGdldFBhcmVudEVsZW1lbnQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jb2RlQmxvY2tFbGVtZW50LnBhcmVudEVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFkZENsZWFyQnV0dG9uKCkge1xyXG5cdFx0Y29uc3QgcGFyZW50RWwgPSB0aGlzLmdldFBhcmVudEVsZW1lbnQoKTtcclxuXHJcblx0XHR0aGlzLmNsZWFyQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcclxuXHRcdHRoaXMuY2xlYXJCdXR0b24uY2xhc3NOYW1lID0gXCJjbGVhci1idXR0b25cIjtcclxuXHRcdHRoaXMuY2xlYXJCdXR0b24uc2V0VGV4dChcIkNsZWFyXCIpO1xyXG5cdFx0dGhpcy5jbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5kZWxldGUoKSk7XHJcblxyXG5cdFx0cGFyZW50RWwuYXBwZW5kQ2hpbGQodGhpcy5jbGVhckJ1dHRvbik7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFkZE91dHB1dEVsZW1lbnQoKSB7XHJcblx0XHRjb25zdCBwYXJlbnRFbCA9IHRoaXMuZ2V0UGFyZW50RWxlbWVudCgpO1xyXG5cclxuXHRcdGNvbnN0IGhyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpO1xyXG5cclxuXHRcdHRoaXMub3V0cHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjb2RlXCIpO1xyXG5cdFx0dGhpcy5vdXRwdXRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJsYW5ndWFnZS1vdXRwdXRcIik7XHJcblxyXG5cdFx0Ly8gVE9ETzogQWRkaXRpb25hbGx5IGluY2x1ZGUgY2xhc3MgZXhlY3V0b3Itb3V0cHV0P1xyXG5cdFx0Ly8gdGhpcy5vdXRwdXRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJleGVjdXRvci1vdXRwdXRcIik7XHJcblxyXG5cdFx0dGhpcy5vdXRwdXRFbGVtZW50LmFwcGVuZENoaWxkKGhyKTtcclxuXHRcdGlmICh0aGlzLmlucHV0U3RhdGUgIT0gXCJOT1RfRE9JTkdcIikgdGhpcy5hZGRJbnB1dEVsZW1lbnQoKTtcclxuXHRcdHBhcmVudEVsLmFwcGVuZENoaWxkKHRoaXMub3V0cHV0RWxlbWVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYW4gaW50ZXJhY3RpdmUgaW5wdXQgZWxlbWVudCB0byB0aGUgb3V0cHV0dGVyXHJcblx0ICovXHJcblx0cHJpdmF0ZSBhZGRJbnB1dEVsZW1lbnQoKSB7XHJcblx0XHR0aGlzLmlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuXHRcdHRoaXMuaW5wdXRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbnRlcmFjdGl2ZS1zdGRpblwiKTtcclxuXHRcdHRoaXMuaW5wdXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZSkgPT4ge1xyXG5cdFx0XHRpZiAoZS5rZXkgPT0gXCJFbnRlclwiKSB7XHJcblx0XHRcdFx0dGhpcy5wcm9jZXNzSW5wdXQodGhpcy5pbnB1dEVsZW1lbnQudmFsdWUgKyBcIlxcblwiKTtcclxuXHRcdFx0XHR0aGlzLmlucHV0RWxlbWVudC52YWx1ZSA9IFwiXCI7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblxyXG5cclxuXHRcdHRoaXMub3V0cHV0RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmlucHV0RWxlbWVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBFbnN1cmUgdGhhdCBpbnB1dCBmcm9tIGEgdXNlciBnZXRzIGVjaG9lZCB0byB0aGUgb3V0cHV0dGVyIGJlZm9yZSBiZWluZyBlbWl0dGVkIHRvIGV2ZW50IHN1YnNjcmliZXJzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGlucHV0IGEgbGluZSBvZiBpbnB1dCBmcm9tIHRoZSB1c2VyLiBJbiBtb3N0IGFwcGxpY2F0aW9ucywgc2hvdWxkIGVuZCB3aXRoIGEgbmV3bGluZS5cclxuXHQgKi9cclxuXHRwcml2YXRlIHByb2Nlc3NJbnB1dChpbnB1dDogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmFkZFN0ZGluKCkuYXBwZW5kVGV4dChpbnB1dCk7XHJcblxyXG5cdFx0dGhpcy5lbWl0KFwiZGF0YVwiLCBpbnB1dCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFkZFN0ZGluKCk6IEhUTUxTcGFuRWxlbWVudCB7XHJcblx0XHRyZXR1cm4gdGhpcy5hZGRTdHJlYW1TZWdtZW50RWxlbWVudChcInN0ZGluXCIpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhZGRTdGRlcnIoKTogSFRNTFNwYW5FbGVtZW50IHtcclxuXHRcdHJldHVybiB0aGlzLmFkZFN0cmVhbVNlZ21lbnRFbGVtZW50KFwic3RkZXJyXCIpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhZGRTdGRvdXQoKTogSFRNTFNwYW5FbGVtZW50IHtcclxuXHRcdHJldHVybiB0aGlzLmFkZFN0cmVhbVNlZ21lbnRFbGVtZW50KFwic3Rkb3V0XCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIHdyYXBwZXIgZWxlbWVudCBmb3IgYSBzZWdtZW50IG9mIGEgc3RhbmRhcmQgc3RyZWFtLlxyXG5cdCAqIEluIG9yZGVyIHRvIGludGVybWluZ2xlIHRoZSBzdHJlYW1zIGFzIHRoZXkgYXJlIG91dHB1dCB0bywgc2VnbWVudHNcclxuXHQgKiBhcmUgbW9yZSBlZmZlY3RpdmUgdGhhbiBvbmUtZWxlbWVudC1mb3ItZWFjaC5cclxuXHQgKlxyXG5cdCAqIElmIHRoZSBsYXN0IHNlZ21lbnQgd2FzIG9mIHRoZSBzYW1lIHN0cmVhbSwgaXQgd2lsbCBiZSByZXR1cm5lZCBpbnN0ZWFkLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHN0cmVhbUlkIFRoZSBzdGFuZGFyZCBzdHJlYW0ncyBuYW1lIChzdGRlcnIsIHN0ZG91dCwgb3Igc3RkaW4pXHJcblx0ICogQHJldHVybnMgdGhlIHdyYXBwZXIgYHNwYW5gIGVsZW1lbnRcclxuXHQgKi9cclxuXHRwcml2YXRlIGFkZFN0cmVhbVNlZ21lbnRFbGVtZW50KHN0cmVhbUlkOiBcInN0ZGVyclwiIHwgXCJzdGRvdXRcIiB8IFwic3RkaW5cIik6IEhUTUxTcGFuRWxlbWVudCB7XHJcblx0XHRpZiAoIXRoaXMub3V0cHV0RWxlbWVudCkgdGhpcy5hZGRPdXRwdXRFbGVtZW50KCk7XHJcblxyXG5cdFx0aWYgKHRoaXMubGFzdFByaW50RWxlbSlcclxuXHRcdFx0aWYgKHRoaXMubGFzdFByaW50RWxlbS5jbGFzc0xpc3QuY29udGFpbnMoc3RyZWFtSWQpKSByZXR1cm4gdGhpcy5sYXN0UHJpbnRFbGVtO1xyXG5cclxuXHRcdGNvbnN0IHN0ZEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuXHRcdHN0ZEVsZW0uYWRkQ2xhc3Moc3RyZWFtSWQpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlucHV0RWxlbWVudCkge1xyXG5cdFx0XHR0aGlzLm91dHB1dEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHN0ZEVsZW0sIHRoaXMuaW5wdXRFbGVtZW50KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMub3V0cHV0RWxlbWVudC5hcHBlbmRDaGlsZChzdGRFbGVtKTtcclxuXHRcdH1cclxuXHRcdHRoaXMubGFzdFByaW50RWxlbSA9IHN0ZEVsZW07XHJcblxyXG5cdFx0cmV0dXJuIHN0ZEVsZW1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcGVuZHMgc29tZSB0ZXh0IHRvIGEgZ2l2ZW4gZWxlbWVudC4gUmVzcGVjdHMgYHRoaXMuZXNjYXBlSFRNTGAgZm9yIHdoZXRoZXIgb3Igbm90IHRvIGVzY2FwZSBIVE1MLlxyXG5cdCAqIElmIG5vdCBlc2NhcGluZyBIVE1MLCBhcHBlbmRzIHRoZSB0ZXh0IHRvIHRoZSBIVE1MIGJ1ZmZlciB0byBlbnN1cmUgdGhhdCB0aGUgd2hvbGUgSFRNTCBzZWdtZW50IGlzIHJlY2lldmVkXHJcblx0ICogYmVmb3JlIHBhcnNpbmcgaXQuXHJcblx0ICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCB0byBhcHBlbmQgdG9cclxuXHQgKiBAcGFyYW0gdGV4dCB0ZXh0IHRvIGFwcGVuZFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgZXNjYXBlQXdhcmVBcHBlbmQoZWxlbWVudDogSFRNTEVsZW1lbnQsIHRleHQ6IHN0cmluZykge1xyXG5cdFx0aWYgKHRoaXMuZXNjYXBlSFRNTCkge1xyXG5cdFx0XHQvLyBJZiB3ZSdyZSBlc2NhcGluZyBIVE1MLCBqdXN0IGFwcGVuZCB0aGUgdGV4dFxyXG5cdFx0XHRlbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnBlcnNpc3RlbnRPdXB1dCkge1xyXG5cdFx0XHRcdC8vIEFsc28gYXBwZW5kIHRvIGZpbGUgaW4gc2VwYXJhdGUgY29kZSBibG9ja1xyXG5cdFx0XHRcdHRoaXMuc2F2ZVRvRmlsZS5hZGRPdXRwdXQodGV4dCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmh0bWxCdWZmZXIgKz0gdGV4dDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlcyB0aGUgSFRNTCBidWZmZXIgYW5kIGFwcGVuZHMgaXRzIGVsZW1lbnRzIHRvIGEgZ2l2ZW4gcGFyZW50IGVsZW1lbnQuXHJcblx0ICogRXJhc2VzIHRoZSBIVE1MIGJ1ZmZlciBhZnRlcndhcmRzLlxyXG5cdCAqIEBwYXJhbSBlbGVtZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRvXHJcblx0ICovXHJcblx0cHJpdmF0ZSB3cml0ZUhUTUxCdWZmZXIoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcclxuXHRcdGlmICh0aGlzLmh0bWxCdWZmZXIgIT09IFwiXCIpIHtcclxuXHRcdFx0dGhpcy5tYWtlT3V0cHV0VmlzaWJsZSgpO1xyXG5cclxuXHRcdFx0Y29uc3QgcGFja2V0OiBQYWNrZXQgPSB0aGlzLnBhcnNlUGFja2V0KHRoaXMuaHRtbEJ1ZmZlcik7XHJcblxyXG5cdFx0XHRjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdFx0Y29udGVudC5pbm5lckhUTUwgPSBwYWNrZXQuYWN0aW9uO1xyXG5cdFx0XHRmb3IgKGNvbnN0IGNoaWxkRWxlbSBvZiBBcnJheS5mcm9tKGNvbnRlbnQuY2hpbGROb2RlcykpXHJcblx0XHRcdFx0ZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZEVsZW0pO1xyXG5cclxuXHRcdFx0Ly8gVE9ETzogSW5jbHVkZSB0byBmaWxlIG91dHB1dCxcclxuXHRcdFx0Ly8gdGhpcy5zYXZlVG9GaWxlLmFkZE91dHB1dCh0aGlzLmh0bWxCdWZmZXIpO1xyXG5cclxuXHRcdFx0dGhpcy5odG1sQnVmZmVyID0gXCJcIjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcGFyc2VQYWNrZXQoYnVmZmVyOiBzdHJpbmcpOiBQYWNrZXQge1xyXG5cdFx0Y29uc3QgW2FjdGlvbiwgZGF0YSwgb3B0aW9uc1N0cl0gPSBidWZmZXIuc3BsaXQoU0VQQVJBVE9SKTtcclxuXHJcblx0XHRpZiAoIWFjdGlvbikgdGhyb3cgYEludmFsaWQgcGFja2V0OiAke2J1ZmZlcn0uYDtcclxuXHJcblx0XHRsZXQgb3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcblx0XHRpZiAoIW9wdGlvbnNTdHIpIHJldHVybiB7IGFjdGlvbiwgZGF0YSwgb3B0aW9ucyB9O1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdG9wdGlvbnMgPSBKU09OLnBhcnNlKG9wdGlvbnNTdHIpO1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBwYXJzZSBvcHRpb25zIEpTT046ICR7KGUgYXMgRXJyb3IpLm1lc3NhZ2V9YCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4geyBhY3Rpb24sIGRhdGEsIG9wdGlvbnMgfTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyBpZiBlaXRoZXI6XHJcblx0ICogLSB0aGlzIG91dHB1dHRlciBoYXMgcHJpbnRlZCBzb21ldGhpbmcgYmVmb3JlLlxyXG5cdCAqIC0gdGhlIGdpdmVuIGB0ZXh0YCBpcyBub24tZW1wdHkuXHJcblx0ICogSWYgYHRleHRgIGlzIG5vbi1lbXB0eSwgdGhpcyBmdW5jdGlvbiB3aWxsIGFzc3VtZSB0aGF0IGl0IGdldHMgcHJpbnRlZCBsYXRlci5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB0ZXh0IFRleHQgd2hpY2ggaXMgdG8gYmUgcHJpbnRlZFxyXG5cdCAqIEByZXR1cm5zIFdoZXRoZXIgdGV4dCBoYXMgYmVlbiBwcmludGVkIG9yIHdpbGwgYmUgcHJpbnRlZFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgdGV4dFByaW50ZWQodGV4dDogc3RyaW5nKSB7XHJcblx0XHRpZiAodGhpcy5oYWRQcmV2aW91c2x5UHJpbnRlZCkgcmV0dXJuIHRydWU7XHJcblxyXG5cdFx0aWYgKHRleHQuY29udGFpbnMoVE9HR0xFX0hUTUxfU0lHSUwpKSByZXR1cm4gZmFsc2U7XHJcblx0XHRpZiAodGV4dCA9PT0gXCJcIikgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuaGFkUHJldmlvdXNseVByaW50ZWQgPSB0cnVlO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXN0b3JlcyBvdXRwdXQgZWxlbWVudHMgYWZ0ZXIgdGhlIG91dHB1dHRlciBoYXMgYmVlbiBgZGVsZXRlKClgZCBvciBgY2xlYXIoKWBkLlxyXG5cdCAqIEBzZWUge0BsaW5rIGRlbGV0ZSgpfVxyXG5cdCAqIEBzZWUge0BsaW5rIGNsZWFyKCl9XHJcblx0ICovXHJcblx0cHJpdmF0ZSBtYWtlT3V0cHV0VmlzaWJsZSgpIHtcclxuXHRcdHRoaXMuY2xvc2VJbnB1dCgpO1xyXG5cdFx0aWYgKCF0aGlzLmNsZWFyQnV0dG9uKSB0aGlzLmFkZENsZWFyQnV0dG9uKCk7XHJcblx0XHRpZiAoIXRoaXMub3V0cHV0RWxlbWVudCkgdGhpcy5hZGRPdXRwdXRFbGVtZW50KCk7XHJcblxyXG5cdFx0dGhpcy5pbnB1dFN0YXRlID0gXCJPUEVOXCI7XHJcblx0XHR0aGlzLm91dHB1dEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuXHRcdHRoaXMuY2xlYXJCdXR0b24uY2xhc3NOYW1lID0gXCJjbGVhci1idXR0b25cIjtcclxuXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0aWYgKHRoaXMuaW5wdXRTdGF0ZSA9PT0gXCJPUEVOXCIpIHRoaXMuaW5wdXRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImlubGluZVwiO1xyXG5cdFx0fSwgMTAwMClcclxuXHR9XHJcbn1cclxuIl19