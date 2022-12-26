import {LanguageId} from "src/main";

/**
 * Interface that contains all the settings for the extension.
 */
export interface ExecutorSettings {
	lastOpenLanguageTab: LanguageId | undefined
	
	timeout: number;
	allowInput: boolean;
	wslMode: boolean;
	nodePath: string;
	nodeArgs: string;
	jsInject: string;
	tsPath: string;
	tsArgs: string;
	tsInject: string;
	luaPath: string;
	luaArgs: string;
	luaInject: string;
	csPath: string;
	csArgs: string;
	csInject: string;
	pythonPath: string;
	pythonArgs: string;
	pythonEmbedPlots: boolean;
	pythonInject: string;
	shellPath: string;
	shellArgs: string;
	shellFileExtension: string;
	shellInject: string;
	batchPath: string;
	batchArgs: string;
	batchFileExtension: string;
	batchInject: string;
	groovyPath: string;
	groovyArgs: string;
	groovyFileExtension: string;
	groovyInject: string;
	golangPath: string,
	golangArgs: string,
	golangFileExtension: string,
	goInject: string;
	javaPath: string,
	javaArgs: string,
	javaFileExtension: string,
	javaInject: string;
	maxPrologAnswers: number;
	prologInject: string;
	powershellPath: string;
	powershellArgs: string;
	powershellFileExtension: string;
	powershellInject: string;
	cargoPath: string;
	cargoEvalArgs: string;
	rustInject: string;
	cppRunner: string;
	cppInject: string;
	cppArgs: string;
	cppUseMain: boolean;
	clingPath: string;
	clingArgs: string;
	clingStd: string;
	rustFileExtension: string,
	RPath: string;
	RArgs: string;
	REmbedPlots: boolean;
	rInject: string;
	kotlinPath: string;
	kotlinArgs: string;
	kotlinFileExtension: string;
	kotlinInject: string;
	runghcPath: string;
	ghcPath: string;
	ghciPath: string;
	haskellInject: string;
	useGhci: boolean;
	mathematicaPath: string;
	mathematicaArgs: string;
	mathematicaFileExtension: string;
	mathematicaInject: string;
	scalaPath: string;
	scalaArgs: string;
	scalaFileExtension: string;
	scalaInject: string;
	cArgs: string;
	cUseMain: boolean;
	cInject: string;

	jsInteractive: boolean;
	tsInteractive: boolean;
	csInteractive: boolean;
	luaInteractive: boolean;
	pythonInteractive: boolean;
	cppInteractive: boolean;
	prologInteractive: boolean;
	shellInteractive: boolean;
	batchInteractive: boolean;
	bashInteractive: boolean;
	groovyInteractive: boolean;
	rInteractive: boolean;
	goInteractive: boolean;
	rustInteractive: boolean;
	javaInteractive: boolean;
	powershellInteractive: boolean;
	kotlinInteractive: boolean;
	mathematicaInteractive: boolean;
	haskellInteractive: boolean;
	scalaInteractive: boolean;
	cInteractive: boolean;
}


/**
 * The default settings for the extensions as implementation of the ExecutorSettings interface.
 */
export const DEFAULT_SETTINGS: ExecutorSettings = {
	lastOpenLanguageTab: undefined,
	
	timeout: 10000,
	allowInput: true,
	wslMode: false,
	nodePath: "node",
	nodeArgs: "",
	jsInject: "",
	tsPath: "ts-node",
	tsArgs: "",
	tsInject: "",
	luaPath: "lua",
	luaArgs: "",
	luaInject: "",
	csPath: "dotnet-script",
	csArgs: "",
	csInject: "",
	pythonPath: "python",
	pythonArgs: "",
	pythonEmbedPlots: true,
	pythonInject: "",
	shellPath: "bash",
	shellArgs: "",
	shellFileExtension: "sh",
	shellInject: "",
	batchPath: "cmd",
	batchArgs: "",
	batchFileExtension: "bat",
	batchInject: "",
	groovyPath: "groovy",
	groovyArgs: "",
	groovyFileExtension: "groovy",
	groovyInject: "",
	golangPath: "go",
	golangArgs: "run",
	golangFileExtension: "go",
	goInject: "",
	javaPath: "java",
	javaArgs: "-ea",
	javaFileExtension: "java",
	javaInject: "",
	maxPrologAnswers: 15,
	prologInject: "",
	powershellPath: "powershell",
	powershellArgs: "-file",
	powershellFileExtension: "ps1",
	powershellInject: "",
	cargoPath: "cargo",
	cargoEvalArgs: "",
	rustInject: "",
	cppRunner: "cling",
	cppInject: "",
	cppArgs: "",
	cppUseMain: false,
	clingPath: "cling",
	clingArgs: "",
	clingStd: "c++17",
	rustFileExtension: "rs",
	RPath: "Rscript",
	RArgs: "",
	REmbedPlots: true,
	rInject: "",
	kotlinPath: "kotlinc",
	kotlinArgs: "-script",
	kotlinFileExtension: "kts",
	kotlinInject: "",
	runghcPath: "runghc",
	ghcPath: "ghc",
	ghciPath: "ghci",
	useGhci: false,
	haskellInject: "",
	mathematicaPath: "wolframscript",
	mathematicaArgs: "-file",
	mathematicaFileExtension: "wls",
	mathematicaInject: "",
	scalaPath: "scala",
	scalaArgs: "",
	scalaFileExtension: "scala",
	scalaInject: "",
	cArgs: "",
	cUseMain: true,
	cInject: "",

	jsInteractive: true,
	tsInteractive: false,
	csInteractive: false,
	luaInteractive: false,
	pythonInteractive: true,
	cppInteractive: false,
	prologInteractive: false,
	shellInteractive: false,
	batchInteractive: false,
	bashInteractive: false,
	groovyInteractive: false,
	rInteractive: false,
	goInteractive: false,
	rustInteractive: false,
	javaInteractive: false,
	powershellInteractive: false,
	kotlinInteractive: false,
	mathematicaInteractive: false,
	haskellInteractive: false,
	scalaInteractive: false,
	cInteractive: false
}
