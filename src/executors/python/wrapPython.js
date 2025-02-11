export const PLT_DEFAULT_BACKEND_PY_VAR = "OBSIDIAN_EXECUTE_CODE_MATPLOTLIB_DEFAULT_BACKEND";
export default (code, globalsName, printName, finishSigil, embedPlots) => 
/*python*/ `
${embedPlots ?
    // Use 'agg' raster non-interactive renderer to prevent freezing the runtime on plt.show()
    /*python*/ `
try:
    matplotlib.use('agg')
except:
    pass
` :
    // Use the default renderer stored in the python variable from 'async setup()' in 'PythonExecutor' when not embedding
    /*python*/ `
try:
    matplotlib.use(${PLT_DEFAULT_BACKEND_PY_VAR})
except:
    pass
`}

try:
    try:
        ${printName}(eval(
            compile(${JSON.stringify(code.replace(/\r\n/g, "\n") + "\n")}, "<code block>", "eval"),
            ${globalsName}
        ))
    except SyntaxError:
        exec(
            compile(${JSON.stringify(code.replace(/\r\n/g, "\n") + "\n")}, "<code block>", "exec"),
            ${globalsName}
        )
except Exception as e:
    ${printName} (e, file=sys.stderr)
finally:
    ${printName} ("${finishSigil}", end="")

`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcFB5dGhvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndyYXBQeXRob24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsa0RBQWtELENBQUM7QUFFN0YsZUFBZSxDQUFDLElBQVksRUFBRSxXQUFtQixFQUFFLFNBQWlCLEVBQUUsV0FBbUIsRUFBRSxVQUFtQixFQUFFLEVBQUU7QUFDbEgsVUFBVSxDQUFBO0VBQ1IsVUFBVSxDQUFDLENBQUM7SUFDZCwwRkFBMEY7SUFDMUYsVUFBVSxDQUFBOzs7OztDQUtULENBQUMsQ0FBQztJQUNILHFIQUFxSDtJQUNySCxVQUFVLENBQUE7O3FCQUVXLDBCQUEwQjs7O0NBRzlDOzs7O1VBSVMsU0FBUztzQkFDRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztjQUMxRCxXQUFXOzs7O3NCQUlILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO2NBQzFELFdBQVc7OztNQUduQixTQUFTOztNQUVULFNBQVMsTUFBTSxXQUFXOztDQUUvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IFBMVF9ERUZBVUxUX0JBQ0tFTkRfUFlfVkFSID0gXCJPQlNJRElBTl9FWEVDVVRFX0NPREVfTUFUUExPVExJQl9ERUZBVUxUX0JBQ0tFTkRcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChjb2RlOiBzdHJpbmcsIGdsb2JhbHNOYW1lOiBzdHJpbmcsIHByaW50TmFtZTogc3RyaW5nLCBmaW5pc2hTaWdpbDogc3RyaW5nLCBlbWJlZFBsb3RzOiBib29sZWFuKSA9PlxyXG4vKnB5dGhvbiovYFxyXG4ke2VtYmVkUGxvdHMgP1xyXG4vLyBVc2UgJ2FnZycgcmFzdGVyIG5vbi1pbnRlcmFjdGl2ZSByZW5kZXJlciB0byBwcmV2ZW50IGZyZWV6aW5nIHRoZSBydW50aW1lIG9uIHBsdC5zaG93KClcclxuLypweXRob24qL2BcclxudHJ5OlxyXG4gICAgbWF0cGxvdGxpYi51c2UoJ2FnZycpXHJcbmV4Y2VwdDpcclxuICAgIHBhc3NcclxuYCA6XHJcbi8vIFVzZSB0aGUgZGVmYXVsdCByZW5kZXJlciBzdG9yZWQgaW4gdGhlIHB5dGhvbiB2YXJpYWJsZSBmcm9tICdhc3luYyBzZXR1cCgpJyBpbiAnUHl0aG9uRXhlY3V0b3InIHdoZW4gbm90IGVtYmVkZGluZ1xyXG4vKnB5dGhvbiovYFxyXG50cnk6XHJcbiAgICBtYXRwbG90bGliLnVzZSgke1BMVF9ERUZBVUxUX0JBQ0tFTkRfUFlfVkFSfSlcclxuZXhjZXB0OlxyXG4gICAgcGFzc1xyXG5gfVxyXG5cclxudHJ5OlxyXG4gICAgdHJ5OlxyXG4gICAgICAgICR7cHJpbnROYW1lfShldmFsKFxyXG4gICAgICAgICAgICBjb21waWxlKCR7SlNPTi5zdHJpbmdpZnkoY29kZS5yZXBsYWNlKC9cXHJcXG4vZywgXCJcXG5cIikgKyBcIlxcblwiKX0sIFwiPGNvZGUgYmxvY2s+XCIsIFwiZXZhbFwiKSxcclxuICAgICAgICAgICAgJHtnbG9iYWxzTmFtZX1cclxuICAgICAgICApKVxyXG4gICAgZXhjZXB0IFN5bnRheEVycm9yOlxyXG4gICAgICAgIGV4ZWMoXHJcbiAgICAgICAgICAgIGNvbXBpbGUoJHtKU09OLnN0cmluZ2lmeShjb2RlLnJlcGxhY2UoL1xcclxcbi9nLCBcIlxcblwiKSArIFwiXFxuXCIpfSwgXCI8Y29kZSBibG9jaz5cIiwgXCJleGVjXCIpLFxyXG4gICAgICAgICAgICAke2dsb2JhbHNOYW1lfVxyXG4gICAgICAgIClcclxuZXhjZXB0IEV4Y2VwdGlvbiBhcyBlOlxyXG4gICAgJHtwcmludE5hbWV9IChlLCBmaWxlPXN5cy5zdGRlcnIpXHJcbmZpbmFsbHk6XHJcbiAgICAke3ByaW50TmFtZX0gKFwiJHtmaW5pc2hTaWdpbH1cIiwgZW5kPVwiXCIpXHJcblxyXG5gO1xyXG4iXX0=