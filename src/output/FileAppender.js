export default class FileAppender {
    constructor(view, blockElem) {
        this.view = view;
        this.codeBlockElement = blockElem;
        try {
            this.codeBlockRange = this.getRangeOfCodeBlock(blockElem);
        }
        catch (e) {
            console.error("Error finding code block range: Probably because of 'run-' prefix");
            this.codeBlockRange = null;
        }
    }
    clearOutput() {
        if (this.codeBlockRange && this.outputPosition) {
            const editor = this.view.editor;
            //Offset this.outputPosition by "\n```"
            const afterEndOfOutputCodeBlock = {
                line: this.outputPosition.line + 1,
                ch: "```".length + 1
            };
            editor.replaceRange("", this.codeBlockRange.to, afterEndOfOutputCodeBlock);
            this.view.setViewData(editor.getValue(), false);
            this.outputPosition = null;
        }
    }
    addOutput(output) {
        try {
            this.findOutputTarget();
        }
        catch (e) {
            console.error("Error finding output target: Probably because of 'run-' prefix");
            this.view.setViewData(this.view.editor.getValue(), false);
            return;
        }
        const editor = this.view.editor;
        editor.replaceRange(output, this.outputPosition);
        const lines = output.split("\n");
        this.outputPosition = {
            line: this.outputPosition.line + (lines.length - 1),
            ch: (lines.length == 1 ? //if the addition is only 1 line, then offset from the existing position.
                this.outputPosition.ch : 0 //If it's not, ignore it.
            ) + lines[lines.length - 1].length
        };
        this.view.setViewData(this.view.editor.getValue(), false);
    }
    /**
     * Finds where output should be appended to and sets the `outputPosition` property to reflect it.
     * @param addIfNotExist Add an `output` code block if one doesn't exist already
     */
    findOutputTarget(addIfNotExist = true) {
        const editor = this.view.editor;
        const EXPECTED_SUFFIX = "\n```output\n";
        const sigilEndIndex = editor.posToOffset(this.codeBlockRange.to) + EXPECTED_SUFFIX.length;
        const outputBlockSigilRange = {
            from: this.codeBlockRange.to,
            to: {
                ch: 0,
                line: this.codeBlockRange.to.line + 2 // the suffix adds 2 lines
            }
        };
        const hasOutput = editor.getRange(outputBlockSigilRange.from, outputBlockSigilRange.to) == EXPECTED_SUFFIX;
        if (hasOutput) {
            //find the first code block end that occurs after the ```output sigil
            const index = editor.getValue().indexOf("\n```\n", sigilEndIndex);
            //bail out if we didn't find an end
            if (index == -1) {
                this.outputPosition = outputBlockSigilRange.to;
            }
            else {
                //subtract 1 so output appears before the newline
                this.outputPosition = editor.offsetToPos(index - 1);
            }
        }
        else if (addIfNotExist) {
            editor.replaceRange(EXPECTED_SUFFIX + "```\n", this.codeBlockRange.to);
            this.view.data = this.view.editor.getValue();
            //We need to recalculate the outputPosition because the insertion will've changed the lines.
            //The expected suffix ends with a newline, so the column will always be 0;
            //the row will be the current row + 2: the suffix adds 2 lines
            this.outputPosition = {
                ch: 0,
                line: this.codeBlockRange.to.line + 2
            };
        }
        else {
            this.outputPosition = outputBlockSigilRange.to;
        }
    }
    /**
     * With a starting line, ending line, and number of codeblocks in-between those, find the exact EditorRange of a code block.
     *
     * @param startLine The line to start searching at
     * @param endLine The line to end searching AFTER (i.e. it is inclusive)
     * @param searchBlockIndex The index of code block, within the startLine-endLine range, to search for
     * @returns an EditorRange representing the range occupied by the given block, or null if it couldn't be found
     */
    findExactCodeBlockRange(startLine, endLine, searchBlockIndex) {
        const editor = this.view.editor;
        const textContent = editor.getValue();
        const startIndex = editor.posToOffset({ ch: 0, line: startLine });
        const endIndex = editor.posToOffset({ ch: 0, line: endLine + 1 });
        //Start the parsing with a given amount of padding.
        //This helps us if the section begins directly with "```".
        //At the end, it iterates through the padding again.
        const PADDING = "\n\n\n\n\n";
        /*
         escaped: whether we are currently in an escape character
         inBlock: whether we are currently inside a code block
         last5: a rolling buffer of the last 5 characters.
            It could technically work with 4, but it's easier to do 5
            and it leaves open future advanced parsing.
         blockStart: the start of the last code block we entered

         */
        let escaped, inBlock, blockI = 0, last5 = PADDING, blockStart;
        for (let i = startIndex; i < endIndex + PADDING.length; i++) {
            const char = i < endIndex ? textContent[i] : PADDING[0];
            last5 = last5.substring(1) + char;
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char == "\\") {
                escaped = true;
                continue;
            }
            if (last5.substring(0, 4) == "\n```") {
                inBlock = !inBlock;
                //If we are entering a block, set the block start
                if (inBlock) {
                    blockStart = i - 4;
                }
                else {
                    //if we're leaving a block, check if its index is the searched index
                    if (blockI == searchBlockIndex) {
                        return {
                            from: this.view.editor.offsetToPos(blockStart),
                            to: this.view.editor.offsetToPos(i)
                        };
                    }
                    else { // if it isn't, just increase the block index
                        blockI++;
                    }
                }
            }
        }
        return null;
    }
    /**
     * Uses an undocumented API to find the EditorRange that corresponds to a given codeblock's element.
     * Returns null if it wasn't able to find the range.
     * @param codeBlock <pre> element of the desired code block
     * @returns the corresponding EditorRange, or null
     */
    getRangeOfCodeBlock(codeBlock) {
        const parent = codeBlock.parentElement;
        const index = Array.from(parent.children).indexOf(codeBlock);
        //@ts-ignore
        const section = this.view.previewMode.renderer.sections.find(x => x.el == parent);
        if (section) {
            return this.findExactCodeBlockRange(section.lineStart, section.lineEnd, index);
        }
        else {
            return null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUFwcGVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRmlsZUFwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBQyxPQUFPLE9BQU8sWUFBWTtJQU03QixZQUFtQixJQUFrQixFQUFFLFNBQXlCO1FBQzVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7UUFFbEMsSUFBSTtZQUNBLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzdEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUE7U0FDN0I7SUFDTCxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBRTVDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRWhDLHVDQUF1QztZQUN2QyxNQUFNLHlCQUF5QixHQUFtQjtnQkFDOUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQ2xDLEVBQUUsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7YUFDdkIsQ0FBQztZQUVGLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWhELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUVN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QUFNLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTdELFlBQVk7UUFDWixNQUFNLE9BQU8sR0FBa0QsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxDQUFDO1FBRWpJLElBQUksT0FBTyxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2xGO2FBQU07WUFDSCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWRpdG9yUG9zaXRpb24sIEVkaXRvclJhbmdlLCBNYXJrZG93blZpZXcgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbGVBcHBlbmRlciB7XHJcbiAgICB2aWV3OiBNYXJrZG93blZpZXc7XHJcbiAgICBjb2RlQmxvY2tFbGVtZW50OiBIVE1MUHJlRWxlbWVudFxyXG4gICAgY29kZUJsb2NrUmFuZ2U6IEVkaXRvclJhbmdlXHJcbiAgICBvdXRwdXRQb3NpdGlvbjogRWRpdG9yUG9zaXRpb247XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHZpZXc6IE1hcmtkb3duVmlldywgYmxvY2tFbGVtOiBIVE1MUHJlRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMudmlldyA9IHZpZXc7XHJcblxyXG4gICAgICAgIHRoaXMuY29kZUJsb2NrRWxlbWVudCA9IGJsb2NrRWxlbTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5jb2RlQmxvY2tSYW5nZSA9IHRoaXMuZ2V0UmFuZ2VPZkNvZGVCbG9jayhibG9ja0VsZW0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZpbmRpbmcgY29kZSBibG9jayByYW5nZTogUHJvYmFibHkgYmVjYXVzZSBvZiAncnVuLScgcHJlZml4XCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNvZGVCbG9ja1JhbmdlID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYXJPdXRwdXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29kZUJsb2NrUmFuZ2UgJiYgdGhpcy5vdXRwdXRQb3NpdGlvbikge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy52aWV3LmVkaXRvcjtcclxuXHJcbiAgICAgICAgICAgIC8vT2Zmc2V0IHRoaXMub3V0cHV0UG9zaXRpb24gYnkgXCJcXG5gYGBcIlxyXG4gICAgICAgICAgICBjb25zdCBhZnRlckVuZE9mT3V0cHV0Q29kZUJsb2NrOiBFZGl0b3JQb3NpdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGxpbmU6IHRoaXMub3V0cHV0UG9zaXRpb24ubGluZSArIDEsXHJcbiAgICAgICAgICAgICAgICBjaDogXCJgYGBcIi5sZW5ndGggKyAxXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFwiXCIsIHRoaXMuY29kZUJsb2NrUmFuZ2UudG8sIGFmdGVyRW5kT2ZPdXRwdXRDb2RlQmxvY2spO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0Vmlld0RhdGEoZWRpdG9yLmdldFZhbHVlKCksIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub3V0cHV0UG9zaXRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkT3V0cHV0KG91dHB1dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5maW5kT3V0cHV0VGFyZ2V0KCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZmluZGluZyBvdXRwdXQgdGFyZ2V0OiBQcm9iYWJseSBiZWNhdXNlIG9mICdydW4tJyBwcmVmaXhcIik7XHJcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRWaWV3RGF0YSh0aGlzLnZpZXcuZWRpdG9yLmdldFZhbHVlKCksIGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy52aWV3LmVkaXRvcjtcclxuXHJcbiAgICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShvdXRwdXQsIHRoaXMub3V0cHV0UG9zaXRpb24pO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5lcyA9IG91dHB1dC5zcGxpdChcIlxcblwiKTtcclxuICAgICAgICB0aGlzLm91dHB1dFBvc2l0aW9uID0ge1xyXG4gICAgICAgICAgICBsaW5lOiB0aGlzLm91dHB1dFBvc2l0aW9uLmxpbmUgKyAobGluZXMubGVuZ3RoIC0gMSksIC8vaWYgdGhlIGFkZGl0aW9uIGlzIG9ubHkgMSBsaW5lLCBkb24ndCBjaGFuZ2UgY3VycmVudCBsaW5lIHBvc1xyXG4gICAgICAgICAgICBjaDogKGxpbmVzLmxlbmd0aCA9PSAxID8gLy9pZiB0aGUgYWRkaXRpb24gaXMgb25seSAxIGxpbmUsIHRoZW4gb2Zmc2V0IGZyb20gdGhlIGV4aXN0aW5nIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vdXRwdXRQb3NpdGlvbi5jaCA6IDAgIC8vSWYgaXQncyBub3QsIGlnbm9yZSBpdC5cclxuICAgICAgICAgICAgKSArIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy52aWV3LnNldFZpZXdEYXRhKHRoaXMudmlldy5lZGl0b3IuZ2V0VmFsdWUoKSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZHMgd2hlcmUgb3V0cHV0IHNob3VsZCBiZSBhcHBlbmRlZCB0byBhbmQgc2V0cyB0aGUgYG91dHB1dFBvc2l0aW9uYCBwcm9wZXJ0eSB0byByZWZsZWN0IGl0LlxyXG4gICAgICogQHBhcmFtIGFkZElmTm90RXhpc3QgQWRkIGFuIGBvdXRwdXRgIGNvZGUgYmxvY2sgaWYgb25lIGRvZXNuJ3QgZXhpc3QgYWxyZWFkeVxyXG4gICAgICovXHJcbiAgICBmaW5kT3V0cHV0VGFyZ2V0KGFkZElmTm90RXhpc3QgPSB0cnVlKSB7XHJcbiAgICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy52aWV3LmVkaXRvcjtcclxuXHJcbiAgICAgICAgY29uc3QgRVhQRUNURURfU1VGRklYID0gXCJcXG5gYGBvdXRwdXRcXG5cIjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2lnaWxFbmRJbmRleCA9IGVkaXRvci5wb3NUb09mZnNldCh0aGlzLmNvZGVCbG9ja1JhbmdlLnRvKSArIEVYUEVDVEVEX1NVRkZJWC5sZW5ndGg7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dHB1dEJsb2NrU2lnaWxSYW5nZTogRWRpdG9yUmFuZ2UgPSB7XHJcbiAgICAgICAgICAgIGZyb206IHRoaXMuY29kZUJsb2NrUmFuZ2UudG8sXHJcbiAgICAgICAgICAgIHRvOiB7XHJcbiAgICAgICAgICAgICAgICBjaDogMCwgLy9zaW5jZSB0aGUgc3VmZml4IGVuZHMgd2l0aCBhIG5ld2xpbmUsIGl0J2xsIGJlIGNvbHVtbiAwXHJcbiAgICAgICAgICAgICAgICBsaW5lOiB0aGlzLmNvZGVCbG9ja1JhbmdlLnRvLmxpbmUgKyAyIC8vIHRoZSBzdWZmaXggYWRkcyAyIGxpbmVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGhhc091dHB1dCA9IGVkaXRvci5nZXRSYW5nZShvdXRwdXRCbG9ja1NpZ2lsUmFuZ2UuZnJvbSwgb3V0cHV0QmxvY2tTaWdpbFJhbmdlLnRvKSA9PSBFWFBFQ1RFRF9TVUZGSVg7XHJcblxyXG4gICAgICAgIGlmIChoYXNPdXRwdXQpIHtcclxuICAgICAgICAgICAgLy9maW5kIHRoZSBmaXJzdCBjb2RlIGJsb2NrIGVuZCB0aGF0IG9jY3VycyBhZnRlciB0aGUgYGBgb3V0cHV0IHNpZ2lsXHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZWRpdG9yLmdldFZhbHVlKCkuaW5kZXhPZihcIlxcbmBgYFxcblwiLCBzaWdpbEVuZEluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIC8vYmFpbCBvdXQgaWYgd2UgZGlkbid0IGZpbmQgYW4gZW5kXHJcbiAgICAgICAgICAgIGlmKGluZGV4ID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm91dHB1dFBvc2l0aW9uID0gb3V0cHV0QmxvY2tTaWdpbFJhbmdlLnRvO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9zdWJ0cmFjdCAxIHNvIG91dHB1dCBhcHBlYXJzIGJlZm9yZSB0aGUgbmV3bGluZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vdXRwdXRQb3NpdGlvbiA9IGVkaXRvci5vZmZzZXRUb1BvcyhpbmRleCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChhZGRJZk5vdEV4aXN0KSB7XHJcbiAgICAgICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoRVhQRUNURURfU1VGRklYICsgXCJgYGBcXG5cIiwgdGhpcy5jb2RlQmxvY2tSYW5nZS50byk7XHJcbiAgICAgICAgICAgIHRoaXMudmlldy5kYXRhID0gdGhpcy52aWV3LmVkaXRvci5nZXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICAvL1dlIG5lZWQgdG8gcmVjYWxjdWxhdGUgdGhlIG91dHB1dFBvc2l0aW9uIGJlY2F1c2UgdGhlIGluc2VydGlvbiB3aWxsJ3ZlIGNoYW5nZWQgdGhlIGxpbmVzLlxyXG4gICAgICAgICAgICAvL1RoZSBleHBlY3RlZCBzdWZmaXggZW5kcyB3aXRoIGEgbmV3bGluZSwgc28gdGhlIGNvbHVtbiB3aWxsIGFsd2F5cyBiZSAwO1xyXG4gICAgICAgICAgICAvL3RoZSByb3cgd2lsbCBiZSB0aGUgY3VycmVudCByb3cgKyAyOiB0aGUgc3VmZml4IGFkZHMgMiBsaW5lc1xyXG4gICAgICAgICAgICB0aGlzLm91dHB1dFBvc2l0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgY2g6IDAsXHJcbiAgICAgICAgICAgICAgICBsaW5lOiB0aGlzLmNvZGVCbG9ja1JhbmdlLnRvLmxpbmUgKyAyXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0cHV0UG9zaXRpb24gPSBvdXRwdXRCbG9ja1NpZ2lsUmFuZ2UudG87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2l0aCBhIHN0YXJ0aW5nIGxpbmUsIGVuZGluZyBsaW5lLCBhbmQgbnVtYmVyIG9mIGNvZGVibG9ja3MgaW4tYmV0d2VlbiB0aG9zZSwgZmluZCB0aGUgZXhhY3QgRWRpdG9yUmFuZ2Ugb2YgYSBjb2RlIGJsb2NrLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBzdGFydExpbmUgVGhlIGxpbmUgdG8gc3RhcnQgc2VhcmNoaW5nIGF0XHJcbiAgICAgKiBAcGFyYW0gZW5kTGluZSBUaGUgbGluZSB0byBlbmQgc2VhcmNoaW5nIEFGVEVSIChpLmUuIGl0IGlzIGluY2x1c2l2ZSlcclxuICAgICAqIEBwYXJhbSBzZWFyY2hCbG9ja0luZGV4IFRoZSBpbmRleCBvZiBjb2RlIGJsb2NrLCB3aXRoaW4gdGhlIHN0YXJ0TGluZS1lbmRMaW5lIHJhbmdlLCB0byBzZWFyY2ggZm9yXHJcbiAgICAgKiBAcmV0dXJucyBhbiBFZGl0b3JSYW5nZSByZXByZXNlbnRpbmcgdGhlIHJhbmdlIG9jY3VwaWVkIGJ5IHRoZSBnaXZlbiBibG9jaywgb3IgbnVsbCBpZiBpdCBjb3VsZG4ndCBiZSBmb3VuZFxyXG4gICAgICovXHJcbiAgICBmaW5kRXhhY3RDb2RlQmxvY2tSYW5nZShzdGFydExpbmU6IG51bWJlciwgZW5kTGluZTogbnVtYmVyLCBzZWFyY2hCbG9ja0luZGV4OiBudW1iZXIpOiBFZGl0b3JSYW5nZSB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IGVkaXRvciA9IHRoaXMudmlldy5lZGl0b3I7XHJcbiAgICAgICAgY29uc3QgdGV4dENvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IGVkaXRvci5wb3NUb09mZnNldCh7IGNoOiAwLCBsaW5lOiBzdGFydExpbmUgfSk7XHJcbiAgICAgICAgY29uc3QgZW5kSW5kZXggPSBlZGl0b3IucG9zVG9PZmZzZXQoeyBjaDogMCwgbGluZTogZW5kTGluZSArIDEgfSk7XHJcblxyXG4gICAgICAgIC8vU3RhcnQgdGhlIHBhcnNpbmcgd2l0aCBhIGdpdmVuIGFtb3VudCBvZiBwYWRkaW5nLlxyXG4gICAgICAgIC8vVGhpcyBoZWxwcyB1cyBpZiB0aGUgc2VjdGlvbiBiZWdpbnMgZGlyZWN0bHkgd2l0aCBcImBgYFwiLlxyXG4gICAgICAgIC8vQXQgdGhlIGVuZCwgaXQgaXRlcmF0ZXMgdGhyb3VnaCB0aGUgcGFkZGluZyBhZ2Fpbi5cclxuICAgICAgICBjb25zdCBQQURESU5HID0gXCJcXG5cXG5cXG5cXG5cXG5cIjtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgIGVzY2FwZWQ6IHdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBpbiBhbiBlc2NhcGUgY2hhcmFjdGVyXHJcbiAgICAgICAgIGluQmxvY2s6IHdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBpbnNpZGUgYSBjb2RlIGJsb2NrXHJcbiAgICAgICAgIGxhc3Q1OiBhIHJvbGxpbmcgYnVmZmVyIG9mIHRoZSBsYXN0IDUgY2hhcmFjdGVycy5cclxuICAgICAgICAgICAgSXQgY291bGQgdGVjaG5pY2FsbHkgd29yayB3aXRoIDQsIGJ1dCBpdCdzIGVhc2llciB0byBkbyA1XHJcbiAgICAgICAgICAgIGFuZCBpdCBsZWF2ZXMgb3BlbiBmdXR1cmUgYWR2YW5jZWQgcGFyc2luZy5cclxuICAgICAgICAgYmxvY2tTdGFydDogdGhlIHN0YXJ0IG9mIHRoZSBsYXN0IGNvZGUgYmxvY2sgd2UgZW50ZXJlZFxyXG5cclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgZXNjYXBlZCwgaW5CbG9jaywgYmxvY2tJID0gMCwgbGFzdDUgPSBQQURESU5HLCBibG9ja1N0YXJ0XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPCBlbmRJbmRleCArIFBBRERJTkcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY2hhciA9IGkgPCBlbmRJbmRleCA/IHRleHRDb250ZW50W2ldIDogUEFERElOR1swXTtcclxuXHJcbiAgICAgICAgICAgIGxhc3Q1ID0gbGFzdDUuc3Vic3RyaW5nKDEpICsgY2hhcjtcclxuICAgICAgICAgICAgaWYgKGVzY2FwZWQpIHtcclxuICAgICAgICAgICAgICAgIGVzY2FwZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaGFyID09IFwiXFxcXFwiKSB7XHJcbiAgICAgICAgICAgICAgICBlc2NhcGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0NS5zdWJzdHJpbmcoMCwgNCkgPT0gXCJcXG5gYGBcIikge1xyXG4gICAgICAgICAgICAgICAgaW5CbG9jayA9ICFpbkJsb2NrO1xyXG4gICAgICAgICAgICAgICAgLy9JZiB3ZSBhcmUgZW50ZXJpbmcgYSBibG9jaywgc2V0IHRoZSBibG9jayBzdGFydFxyXG4gICAgICAgICAgICAgICAgaWYgKGluQmxvY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBibG9ja1N0YXJ0ID0gaSAtIDQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgd2UncmUgbGVhdmluZyBhIGJsb2NrLCBjaGVjayBpZiBpdHMgaW5kZXggaXMgdGhlIHNlYXJjaGVkIGluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2NrSSA9PSBzZWFyY2hCbG9ja0luZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiB0aGlzLnZpZXcuZWRpdG9yLm9mZnNldFRvUG9zKGJsb2NrU3RhcnQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IHRoaXMudmlldy5lZGl0b3Iub2Zmc2V0VG9Qb3MoaSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7Ly8gaWYgaXQgaXNuJ3QsIGp1c3QgaW5jcmVhc2UgdGhlIGJsb2NrIGluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrSSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZXMgYW4gdW5kb2N1bWVudGVkIEFQSSB0byBmaW5kIHRoZSBFZGl0b3JSYW5nZSB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgZ2l2ZW4gY29kZWJsb2NrJ3MgZWxlbWVudC5cclxuICAgICAqIFJldHVybnMgbnVsbCBpZiBpdCB3YXNuJ3QgYWJsZSB0byBmaW5kIHRoZSByYW5nZS5cclxuICAgICAqIEBwYXJhbSBjb2RlQmxvY2sgPHByZT4gZWxlbWVudCBvZiB0aGUgZGVzaXJlZCBjb2RlIGJsb2NrXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBFZGl0b3JSYW5nZSwgb3IgbnVsbFxyXG4gICAgICovXHJcbiAgICBnZXRSYW5nZU9mQ29kZUJsb2NrKGNvZGVCbG9jazogSFRNTFByZUVsZW1lbnQpOiBFZGl0b3JSYW5nZSB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGNvZGVCbG9jay5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pLmluZGV4T2YoY29kZUJsb2NrKTtcclxuXHJcbiAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbjogbnVsbCB8IHsgbGluZVN0YXJ0OiBudW1iZXIsIGxpbmVFbmQ6IG51bWJlciB9ID0gdGhpcy52aWV3LnByZXZpZXdNb2RlLnJlbmRlcmVyLnNlY3Rpb25zLmZpbmQoeCA9PiB4LmVsID09IHBhcmVudCk7XHJcblxyXG4gICAgICAgIGlmIChzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRFeGFjdENvZGVCbG9ja1JhbmdlKHNlY3Rpb24ubGluZVN0YXJ0LCBzZWN0aW9uLmxpbmVFbmQsIGluZGV4KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=