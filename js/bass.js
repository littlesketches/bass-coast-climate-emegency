//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////														  														//////
//////         				THE HUMAN REPRESENTATION OF... BASS COAST EMISSIONS 			   						//////
//////             					       a Little Sketches Experiment												//////
//////             					            version: prototype v0.1  											//////
//////	----------------------------------------------------------------------------------------------------------  //////
//////	This script is an adaption of interaction design work under the umbrella of LIttle Sketches' Humane  	 	//////
//////  representations series to create amore explorable experiences buil in a dynamic medium. Ths project 		//////
//////  howeverm, is more limited to visuslisations as core modelling is conducted outside the browser. 			//////
//////   	  																										//////							                   
//////	This is an early version prototype that is under constant development and carries with it, an 				//////
//////  open source MIT license. The wider concept and application, will be published under a CreativeCommons		//////
//////    non-commercial share-and-share-alike license (exact model still to be determined).						//////
//////																												//////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// "use strict"

window.addEventListener('DOMContentLoaded', init)
 
/////////////////////////////////////////////////////////////////////
///  GLOBAL DATA | STRUCTURED OBJECTS FOR LOADED AND PARSED DATA  /// 
/////////////////////////////////////////////////////////////////////

	// I. Input model data: stores the imported model data (with stings parsed to numbers)
		const loadedData  = {}
		const inputData = {}
		let outputDataArray
	// II. Model data: stores the schema and variables
		const model = {
			// GENERAL MODEL SCHEMA: generated from imported model inputData: supports interface design
			schema: {			
				fields: 				{},			// Object to store field names for each inputModel data sheet
				fieldOptions: 			{},			// Object to store selected field options for each inputModel data sheet	
				units: 					{},			// Object to store meta information on quantitative units imported from data sheet
				time: {								// Object to store meta information about the models time parameters  => this is manually setup in this protoype but will be shifted to a setup object in production 
					timeUnit: 			'year',
					timeUnits: 			'years',
					perTimeUnit: 		'per annum'
				},
				reportTime: 			{}, 		// Object to hold the specfified reporting period (start/times and analysis period)			
				primaryStockUnits: 	 	[], 		// Array of primary stock unit names 	
				lists: {							
					variableIDs: {					// Object to hold list of variable names by type
						auxiliary: 		[],
						temporal: 		[]
					}
				},
				tensorFields: {						// Object to hold list of tensor names by model mode
					baseline: 			{},
					referenceWorld: 	{},
					interventions:  	{} 
				}
			},

			// PARAMETER OBJECT DICTIONARY: All model parameter objects (i.e. with meta data) listed in a single object to act as a master dictionary (aka "elements")	
			parameters: 				{},			// Model parameters refer to any defined part of the model (aka "auxiliaries", "components" or "elements")

			// PARAMETER SCHEMA: as grouped lists that are programmatically generated from inputData. Lists are used to filter the parameters object for analysis.
			parameterList: {	
				allIDs: 				[],				
				byType:  {							// TYPE: adopts convention akin to  Systems Dynamics modelling (i.e. for Stock-FLow modelling, where converters and flows are 'connectors', which link/carry information between elements/components)
					converters: 		[],			// Converters (aka auxiliary variables): Constants and conversion factors/rates. These are variables not defined as flows (in a SFD) and are capable of changing value instantaneously . 
					stocks: 			[],			// Stocks: are parameters that can accumulate or drain over time Stocks are the memory of a system and are only affected by flows. 
					auxStocks: 			[],			// Stocks: are 
					flows: 				[]			// Flows: represent the movement of volumes between stocks. Flows represent activity, in contrast to stocks that represent the state of the system. 
				},
				byClass: { 							// CLASS: Separated array lists by exogenous variables (not affected by changes in the model system)
					exogenous: { 					// EXOGENOUS variables
						converters: 	[],			 
						stocks: 		[],			 
						flows: 			[]				
					},
					endogeneous: {					// ENDOGENOUS
						converters: 	[],			// 
						stocks: 		[],			// 
						flows: 			[]			// The impact of actions on stocks
					},			
				},
				byDelta: {							// DELTA: is a categorisation of parameters for reporting / documentation
					constant: 			[],			// Is a list of all converters (that are modelled as a constant)
					static: 			[],			// Is a temporal parameter that has been modeleld to not change over time (i.e. a flat vector)
					dynamic: 			[]			// Is a temporal parameter that does changes over time
				},
				other: {
					temporal: 			[] 	  		// The list of temporal vectors in the model. These are used to model converters over time.
				}
			},

			// ACTION OBJECTS
			actionBusinessCaseDefault:	{},			// Stores the action business case objects for the default (inputted) assumptions
			actionBusinessCase: 		{},			// The reactive document version of the business case objects(i.e. updatable) of the business case objects
			actionList: {
				allIDs: 				[],
				allLabels: 				[],
				actionIDsByUnitLabels:  '',	
			},
			actionRawData: 				{},			// Raw action data (as parsed) into the model: stored for reference only			

			// STOCK FLOWS: An object of created according to 1) Calculated reference case (growth vectors) and 2) references to action business cases (impacts) that references calcalted impacts (i.e. acts as a wrapper to group flows)
			flows: {
				primary: {
					actionCase: 		{},
					referenceCase: 			{}
				},
				auxiliary: 				{}		
			},

			// INTERFACE DATA OBJECTS
			interface: {
				modal: 					false,		// Boolean to track when the modal window is activated	
				focus: {							// Obbject to track which section of the tool is being viewed
					articleID:  		'introduction-container',			// Initialised to the starting 'introduction page'
					sectionFocus: 		'none',
					actionID: 			''
				},
				data:{								// Object to hold dynamic modelling data
					dynamicVariables: 			{},
					businessCaseTangle: 		'',
					updatedTangleVariables: 	'',
					updatedBCVariables:     	'',
					actionDataTables:       	{},		// Object to hold all actionCase tableData
				},					
				state: {
					tangleInitiated: 				false,				
					tangleUserSettingsInitiated: 	false				
				},
				content:{
					tooltips: 			{}
				}
			}
		}

	// IV. User defined data 
		const user = {
			settings: {
				tanglebyID: 		{},
				actionPaths: 		{},
			}
		}

	// V. API information to retrieve data from Google Sheet or Mongo Stitch DB
		const api = {
			source: 		'gSheet',											// Source from gSheet or stitch app 
			inputTables: 	['baselineStocks', 'referenceStocks', 'actionStockImpacts', 'actionMetaInfo', 'parametersOutput', 'narrative'],   			
			gSheet: {
			  	modelURL: 	"https://docs.google.com/spreadsheets/d/13TsGfwwJsTeyJHJk5WBuymdoc4_F1p6Gkiv1EpwzBW4/edit?usp=sharing",
				tableURLs:   {
							narrative:             'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx__HTvdpEdlOaYThlNlVEMjbLfac3jQoVTTxyjw6PpM-yf_s8z4C5SaUayhUCKIiYzUem0wNY24dL/pub?gid=1485874654&single=true&output=tsv',
							baselineStocks:        'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx__HTvdpEdlOaYThlNlVEMjbLfac3jQoVTTxyjw6PpM-yf_s8z4C5SaUayhUCKIiYzUem0wNY24dL/pub?gid=0&single=true&output=tsv',
							referenceStocks:       'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx__HTvdpEdlOaYThlNlVEMjbLfac3jQoVTTxyjw6PpM-yf_s8z4C5SaUayhUCKIiYzUem0wNY24dL/pub?gid=67794082&single=true&output=tsv',
							actionStockImpacts:    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx__HTvdpEdlOaYThlNlVEMjbLfac3jQoVTTxyjw6PpM-yf_s8z4C5SaUayhUCKIiYzUem0wNY24dL/pub?gid=255756585&single=true&output=tsv',
							actionMetaInfo:        'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx__HTvdpEdlOaYThlNlVEMjbLfac3jQoVTTxyjw6PpM-yf_s8z4C5SaUayhUCKIiYzUem0wNY24dL/pub?gid=529025910&single=true&output=tsv',
							parametersOutput:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx__HTvdpEdlOaYThlNlVEMjbLfac3jQoVTTxyjw6PpM-yf_s8z4C5SaUayhUCKIiYzUem0wNY24dL/pub?gid=2145081565&single=true&output=tsv'
						}
			}
		}
		// Penguins!!
		const penguin1path = "M42.456 52.656c-1.722-1.62-6.234-3.745-3.933-6.139 1.617-2.057 1.518-4.69 1.559-7.163.178-4.465-.076-8.98.31-13.415 2.271 3.783 4.059 7.876 5.839 11.919-.02 1.746 2.852 4.423 2.889 1.29.078-4.01-1.502-7.852-3.095-11.46-1.317-1.182-1.82-2.723-3.182-4.329-.512-.843-1.451-1.523-1.7-2.466-.181-2.878-.254-5.842-1.663-8.443-.235-.82-1.199-1.782-.117-2.347.861-.77 1.607-1.818 2.54-2.416h3.12c.56-2.371-1.874-2.965-3.71-3.14-.866-2.082-2.575-4.05-5.022-4.36-3.153-.586-7.324.114-8.705 3.41-.857 1.77-1.432 3.656-1.907 5.56-1.254-1.268-2.624-2.635-4.551-2.627-3.066-.687-6.552.524-7.987 3.449-1.483 2.459-1.688 5.575-3.835 7.649-2.657 3.389-5.282 6.909-7.004 10.875-.605 2.459-.17 5.415-2.302 7.257.88 2.059.63 4.999 1.472 7.318.04 1.926 1.634-.463 1.743 1.565 2.08 1.652 2.829 2.944 5.298 3.088 2.903 1.132 7.293 4.07 10.265.246 1.133-1.071 2.172-2.336 2.283-3.956 1.244 1.074 1.765 2.23 3.01 3.304-2.692 4.889-.546 5.293 2.052 4.431 4.707.195 3.703-.064 6.022-.952-.87-.128-6.15-3.129-2.787-4.11 1.602-.587 2.734-.34 2.882 1.301 1.946.586 1.768 2.373 1.642 4.06.103 1.284 2.64.495 3.618.862 1.057-.01 3.918-.047 4.956-.261zm-4.142-.925c-1.493-.322-1.834-4.157-.293-.899.898.913 3.024 2.088.293.9zm-13.177-4.01c.734.446-.325 2.434-.074.299zm-11.078-.914c.203-1.228-2.152 2.015-2.442-.032-1.67-.781-.454-3.42.683-1.306.946-1.99 3.784.529 5.509.327-1.44.128-3.042.669-3.684 1.597l-.103-.099zm4.233-.137c.543-1.224.617 1.609 0 0zm19.677-.212c.537-.816 1.717-2.928.719-.628-.068.169-1.09 1.943-.719.628zm-17.747-3.993c1-2.013 1.565 2.208 2.947 2.547.063.644-2.78-1.758-2.947-2.547zm-18.964-1.55c.12-1.057 1.756-2.539-.073-3.008.003 2.467-.572-1.762-.307-2.54 1.86-2.64.722-6.257 2.67-8.88 1-2.148 2.578-3.938 4.263-5.287-1.128-.886 1.836-3.16 2.553-4.424 1.663-1.295 4.377 1.082 6.463.911 1.47-.41 3.237 2.013 1.405 1.84-4.068 1.443-8.217 3.07-11.65 5.76-1.213.634-1.888 2.978.179 1.693 4.237-2.454 8.766-4.509 13.602-5.42 1.285-.848 2.435-.137.521.305-2.556.825-5.333 1.263-7.529 2.914 1.698.103 4.026-.244 4.315 1.88 1.535.326-.572 1.653-.525-.109-1.056 1.494 2.278 1.538.452 1.715-.189 2.217-1.077-1.361-1.514.575.198 1.147-1.042 1.966.282 1.745.245 1.379 2.404 1.482 1.204 2.763.242.826 1.94.92 2.47.492-.203-.112-1.303-.277-.482-1.221 1.019 1.134 1.781.366.42-.128.424-.492 1.302.812 1.005-.8.174.142 1.332 1.128.205 1.083.375 1.149 1.3 2.086-.288.921-.653.141.439 1.024-.777 1.2.035.704-1.387.12-1.976.635-1.703-.91-2.324.615-3.986-.202-1.595.123-1.133 1.667-2.31 1.807.066-2.341-.82.885-1.078 1.354-2.416-.484 1.48 1.803-1.012 1.091-.627 1.225-2.009-.666-3.196-.797-2.106-.737-3.335 1.697-4.887 2.31.577.95.752 3.59-.182 1.217-.14-.45-.249-.92-.237-1.395zm7.883-1.667c-.55-1.26-.609.83 0 0zm7.465-5.235c-1.043-1.158-1.29.38 0 0zm-1.204-.28c-.455-1.033-1.269-1.129-1.74-1.743-.156.892.742 3.343 1.74 1.742zM8.9 28.413c.344-1.987 3.168-2.726 3.834-3.6-1.233.755-5.447 1.294-4.378 3 .74-.225.1 1.385.544.6zm7.826-1.702c.993-3.519-1.332 1.123 0 0zm3.141 11.76c-.243-1.676.089-1.717 1.243-1.803.32-.697-1.258-1.178-.054-1.652.32 1.027 1.436 3.82-.356 2.97.477.846.82 2.295-.002 1.634-.616 1.927-.735-.66-.831-1.15zm26.642-.734c-.532-1.005-1.271-3.489-.278-1.096.545.908 1.756 4.932.661 2.063a83.367 83.367 0 00-.383-.967zm-21.612-.11c-.42-.792-.066-2.293.3-.487.293.215-.513 1.614-.3.487zm-1.813-.771c-.19-.012-2.009-2.842-.217-1.426.207.659 1.788 2.4.217 1.426zm-.94-.166c.595-.88.471 1.176 0 0zm2.89-.829c.65-.97.568.938 0 0zm-.914-.048c-1.448-2.958 2.11.928 0 0zm20.68-2.119c.71.487.845 2.435.106.411zm-25.304-2.219c.536-2.088.675 2.454 0 0zm2.595.331c.122-.881-1.454-2.933.162-.973 1.05.43-.539 1.673-.162.973zm-4.927-1.288c.473-.22-.19 1.067 0 0zm5.222-.918c.275-.769.546.84 0 0zm-4.5-.527c.473-.22-.19 1.067 0 0zm27.61-1.52c-.518-1.214 1.253 1.691 0 0zm-24.96-1.129c.472-.22-.19 1.067 0 0zm-2.726-.21c1.222-.978 1.375.722 0 0zm.055-8.749c-2.01-.854-4.805-.416-6.425-1.813.498-2.838 1.562-5.857 3.738-7.853 1.25-.927 6.224-2.353 5.113.61-.595 1.351 2.262 1.048.95 1.61 1.387 1.823-1.917 2.02-2.589 3.587-.572 1.37-.207 1.845 1.084 1.855 1.419 1.654-3.044 1.006-.51 1.762 1.059-.18 2.663.764.558.501a32.215 32.215 0 01-1.92-.259zm7.487-2.359c.472-.22-.19 1.066 0 0zm-6.182-1.035c.786-3.007 2.525 2.19 0 0zm19.242-2.17c-.826-.77-2.451-3.117-.856-2.394.93-1.573 1.024-2.754-.061-4.532-1.053-.895-.168-2.572.3-.722.931 1.602 2.858 3.557.979 5.178-.96.913 1.76 5.636-.362 2.47zm-11.21-1.353c1.142-1.035 1.374 1.438 0 0zm-1.03.025c-1.036-1.358 1.292-.624.548.123.555.669-.533.154-.548-.123zm12.59-.662c1.425-1.885.82.476 0 0zm-9.316-1.548c.472-.22-.19 1.067 0 0zm10.989-.524c.632-.768-.948-2.817-.493-.923-1.364-1.686 2.03-1.114 1.043.648.014.711-1.148 1.545-.55.275zm-.393-.44c.472-.22-.19 1.067 0 0z",
			penguin2path = "M42.386 52.7c-2.102-1.61-5.872-2.75-4.79-6.206.515-3.866 2.225-7.699 1.266-11.646-.38-3.211-1.01-6.41-.958-9.657 3.554 3.942 6.215 8.579 8.8 13.19 1.8-2.05-.493-4.967-1.02-7.205-1.527-3.768-3.278-7.698-6.572-10.261-1.431-1.606-1.439-4.416-2.453-6.575-1.561-1.676-3.003-3.282-2.499-5.756-.125-2.92-.527-6.682-3.547-8.041-2.977-1.426-7.554-.005-8.006 3.59-.66 3.134.765 6.954-1.177 9.63-.641-3.014-1.195-6.244-3.11-8.784-2.385-2.07-6.222-.99-7.422 1.854-1.385 3.005-1.577 6.476-3.648 9.191-1.947 3.37-4.162 6.619-5.572 10.267.47 3.023-1.961 5.605-1.64 8.652.093 2.827.824 5.783 2.55 8.059 2.45 2.251 5.933 3.136 9.169 3.454 2.846.025 6.073-.452 7.601 2.449 1.936.52 4.059.316 6.064.719 1.555.125 4.609.603 5.239.173-2.22-.503-4.6-2.75-.93-3.097 1.942-.49 4.052 1.57 4.523 3.398-.576 2.75 3.388 1.73 5.029 2.584.976.106 2.226.425 3.103.017zm-20.15-4.966c-.304-2.14-1.281.182-2.384-.481-.417-1.913 2.077-3.69 2.854-1.185.947.982 1.948 2.64-.47 1.666zm-3.26-3.285c.71-2.566.695 3.324 0 0zm1.493-.919c1.5-1.835.214 1.912 0 0zM1.617 40.814c-.987-1.28-.155-2.047.423-.403.698 1.181.832 3.039-.423.403zm18.172.93c.636-1.252.422 1.167 0 0zm.49-1.14c-.667-2.72-1.303-5.488-2.074-8.137-.363-1.072.817-3.03 1.121-.923.551.27.703 3.17 1.23 1.586-.814-2.733 1.391.213.719 1.313 1.576 1.888-.145.432-.596.529.775 1.238 1.39 4.078.64 4.399.34.446-.95 2.69-1.04 1.232zm.786-3.232c-.005-1.555-2.538-.48-.497-.268.152.081.281.476.497.268zm-.555-1.477c-.778-1.932-1.667-.208 0 0zm-.645 3.521c.553-.16-.373 1.083 0 0zm-8.97-.075c.636-1.253.422 1.166 0 0zm-2.012-.648c-1.855.72-5.01 1.096-5.28-1.103-.752-.226-1.285-2.172-.993-.277.595 2.729-2.324 1.844-2.093-.366-.593-2.676.571-5.199 1.1-7.768.74-3.02 4.224-3.713 6.632-4.96 2.883-1.158 5.935-1.922 9.037-2.154 2.84-.764-.729 1.085-1.806.873-1.212.116-3.967.752-4.001 1.298 1.665-.455 4.638-1.408 4.771.856.918 1.151-.149 2.979.081 4.182-1.851-.12-3.486 2.888-2.249 4.027-.957-2.29 3.462 1.696.688.522-2.406.468-.574 5.058-3.282 4.369-1.383.035.336-1.78-.864-1.014-.31 2.407.463 2.192-1.741 1.515zm-7.539-1.14c-.11-1.518-.746 1.099 0 0zm-.065-1.593c.831-2.271-.894-1.256-.422.35.21.884.505-.004.422-.35zm11.863-3.583c-.34-1.935-1.136 1.292 0 0zm-1.637-1.346c-.213-1.252-1.425 1.022 0 0zm2.236-.945c-.23-1.49-.124 1.348 0 0zm-.443-.721c-.616-1.02-.593.982 0 0zm-7.153-2.017c.43-1.066 4.522-3.145 1.547-1.976-.822.285-3.944 1.089-1.547 1.976zm18.452 10.7c-1.422-1.653.047-2.277 1.083-1.063.141.383-.91 2.182-1.083 1.063zm-2.344-.17c1.216-.27-.032 1.316 0 0zm-.3-1.346c1.528-.39 1.503 2.414.253.389-.103-.116-.165-.263-.254-.39zm1.518-1.203c.553-.16-.373 1.083 0 0zm-2.012-3.474c-.495-2.018.903 1.777 0 0zM2.654 24.617c.627-2.6 3.395-3.963 4.808-5.395 1.088-1.27-1.83-1.204-.204-2.653 1.636-2.145 2.81-4.433 2.951-7.164.509-1.878 2.588-5.794 4.608-4.603.178.94 1.574.162 1.982.128 1.294 1.765 2.465 3.964 1.163 6.053-.181 1.39.147 2.16-1.575 1.79-1.795.306-4.757.012-5.848.6 1.97.597 5.79.698 6.15 1.841.603.315 1.047 2.243 1.394 1.077.005 1.857-2.404.761-2.539 2.8-4.36.504-8.934 2.003-12.16 5.143-.113.111-1.056 1.33-.73.383zm3.136-3.278c.647-1.949-1.067 1.358 0 0zm33.711.453c-1.166-1.594 1.631 1.579 0 0zm-19.76-.408c1.475-.524-.7 1.033 0 0zm.787-5.18c.58-3.1 1.024.375 0 0zm-.438-3.835c-.051-1.038-.647-4.459.22-1.774.21.437.737 3.553-.22 1.774zm13.58-4.011c.075-2.396.515 3.202.004.041z"


/////////////////////////////////////////////////////////////////////
///////  MODEL INITIALISTION ND AND DATA INPUT API FUNCTIONS  /////// 
/////////////////////////////////////////////////////////////////////

  	function init(){
  		 getDataFromGS() 		
	}; // end init()
		
    // INPUT DATA LOADING FUNCTIONS: Loads model specification data
	    function getDataFromGS(callback){
			let noLoadedTables = 0
			const tablesToLoad = Object.keys(api.gSheet.tableURLs)
			for (const [tableName, tableURL] of Object.entries(api.gSheet.tableURLs))   {
				Papa.parse(tableURL,  {
                    delimiter: '\t',
					download: true,
					header: true,
					complete: async (results) => {
						loadedData[tableName] = results.data
						noLoadedTables++
						if(noLoadedTables === tablesToLoad.length){            
							await parseData(loadedData)
							await calculatePathwayData()
							
							// Render charts and interface
							addColourPalettes()
							renderBaselineChart()
							renderBubbleVis('bubbleChart', inputData.baselineStocks)
							renderSankey()
							renderWedgesChart()
							renderCostCurve()
			       			createInterface()
						}
					}
				})
			}        


	    }; // end renderFromGS()   



////////////////////////////////////////////////////////////////////
/// GET AND PARSE DATA > CREATE DOM > ADD EFFECTS / INTERACTIONS /// 
////////////////////////////////////////////////////////////////////

    // 1. PARSE IMPORTED DATA TO HROM MODEL STRUCTURE
	async function parseData(loadedData){
		const baselineStocks 	= loadedData.baselineStocks,
			referenceStocks		 = loadedData.referenceStocks, 
			actionStockImpacts	 = loadedData.actionStockImpacts, 
			actionMetaInfo		 = loadedData.actionMetaInfo, 
			parametersOutput	 = loadedData.parametersOutput, 
			narrative			 = loadedData.narrative
    	console.log('Model data loaded..') 	 	

	 	return new Promise(function(resolve, reject){
			const modelOutputData = [baselineStocks, referenceStocks, actionStockImpacts, actionMetaInfo, parametersOutput, narrative],		// Array of loaded data objects
				baselineStocksIDX = api.inputTables.indexOf('baselineStocks')

	    	// a. Setup data object structure: creates an object key for each data object (e.g. inputData, model.schema) 
		    	api.inputTables.forEach((modelSheetName, i) =>{
					inputData[modelSheetName] = []																// Set Object keys and empty 
					model.schema.fieldOptions[modelSheetName] = {}												// elements (array/objects); then
		    		model.schema.fields[modelSheetName] = Object.keys(modelOutputData[i][0])   					// extract field names from each sheet to schema data object  
		    	})

	    	// b. Parse numbers from strings to number and store imported data back to model inputData object
				modelOutputData.forEach( (dataset, i) => {
		        	dataset.forEach( d => {
		        		model.schema.fields[api.inputTables[i]].forEach( field => {						// Parse string to number (with commas removed) and objects/arrays to JSON
							if(field !== '_id'){													// Ignore mongoDB _id field					
								if(!isNaN(+d[field].replace(/,/g, '')) ){									
			        				d[field] = +d[field].replace(/,/g, '')	
								} else if( (d[field].slice(0,1) === "{" && d[field].slice(-1 === "}")) || (d[field].slice(0,1) === "[" && d[field].slice(-1 === "]") && d[field].indexOf(',') > 0 ) ){	
									(function(error, parse){ 
										try {
											JSON.parse(d[field])
										} catch (e) { 	// Log parsing errors to console for debugging
											console.log("**** JSON Parsing error for: ****"); console.log(d[field]); console.log(e)
										} finally{
											d[field] = JSON.parse(d[field])
										}
									}())
								}
							}
		        		})
		        	})
				})

			// c. Store parsed data to data object for convenience (i.e. access/reference to the original imported/parsed data as defaults)
				api.inputTables.forEach( (modelSheetName, i) => inputData[modelSheetName] = modelOutputData[i])

	        // d. Get and store field options (i.e. unique lists)
	        	// Set fields from each imported model sheet where options are sought for setting schema: order must be the same as modelOutputSheet
	        	const modelFieldOptions = [	model.schema.fields.baselineStocks.slice(1,9) ]	// For modelBaseline (slice to extract only those fields for Schema
	        	
	        	// Create options lists for selected fields (for all imported model data)
	        	modelFieldOptions.forEach((fieldNameArray, i) => {
	        		fieldNameArray.forEach(fieldName => {									// Make array of all options entries and push a unique array to the model.schema.options.baseline object
						if (!Array.isArray(fieldName)){										// If fieldName is a string (not an array)
							model.schema.fieldOptions[api.inputTables[i]][fieldName] = [...new Set(modelOutputData[i].map(data => data[fieldName]))]	 
						} else {															
							// If fieldName is an array (of length 2 for action data)
							model.schema.fieldOptions[api.inputTables[i]][fieldName[1]] = [...new Set(modelOutputData[i].map(data => data[fieldName[0]][fieldName[1]] ))]
						}						
	        		})
	        	})

	        // e. Create time array (of years)
		        model.schema.time.yearArray =  model.schema.fields.referenceStocks.filter(d => !isNaN(+d)).map( d => +d)
				model.schema.time.startTime = model.schema.time.yearArray[0]
		        model.schema.time.endTime  = 2030
		        model.schema.reportTime =  model.schema.time.yearArray.filter( d => d <= model.schema.time.endTime)
				model.schema.reportTime.analysisPeriod = model.schema.time.endTime - model.schema.time.startTime

	        // f. Parse model parameters
		        parametersOutput.forEach( obj => {
		        	model.parameterList.allIDs.push(obj.id)
		        	model.parameters[obj.id] = {
		        		name: 			obj.name,
		        		description: 	obj.description,
		        		type: 			obj.type,
		        		unit: 			obj.unit,
		        		unitRate: 		obj.unitRate,
		        		value: 			obj.type === "constant" ?  obj[model.schema.time.startTime] : model.schema.time.yearArray.map( year => obj[year])
		        	}
		        })

		    // g. Parse commentary 
		    	narrative.forEach(obj => {
		    		if(!vis.commentary[obj.vis]) { vis.commentary[obj.vis] = {} }
		    		vis.commentary[obj.vis][obj.scene] = {
		    			title: 		obj.title,
		    			content: 	obj.content
		    		}
		    	})

	        // h. Return empty resolve function for promise (to chain)    
		    	console.log('Model data parsed..')
				return resolve()
	 	}) // end Promise executor function
    }; // parseData()


    // 2. CREATE ACTION AND ACTION CASE / PATHWAYS DATA
	async function calculatePathwayData(){
		console.log('Creating pathways stock data')
		return new Promise(function(resolve, reject){

			model.stocks = {
				metaInfo: 			{},
				referenceCase: {
					emissions: 			{},
					emissionsAbated: 	{},
					energy: 			{},
					naturalVolume: 		{}
				},
				actionCase: 		{
					emissions: 			{},
					emissionsAbated: 	{},
					energy: 			{},
					naturalVolume: 		{}
				},
				actionImpacts: 	{
					byAction: {},
					byStock: {
						emissions: 			{},
						emissionsAbated: 	{},
						energy: 			{},
						naturalVolume: 		{}						
					}
				}
			}

			// 0. Get stock meta data
				inputData.baselineStocks.forEach( obj => {
					model.stocks.metaInfo[ obj.id] =  {
						id: 					obj.id,
						boundary: 				obj.boundary, 
						emissionsSector: 		obj.emissionsSector, 
						economicSector: 		obj.economicSector, 
						endUserType: 			obj.endUserType, 
						activity: 				obj.activity, 
						growthProxy: 			obj.growthProxy, 
						naturalVolume: 			obj.naturalVolume,
						naturalUnit: 			obj.naturalUnit
					}
				})

			// 1. CREATE REFERENCE CASE DATA STRUCTURE
				inputData.referenceStocks.filter(obj => obj.boundary === "Included").forEach( obj => {
					const stock = obj.id
					model.stocks.metaInfo[obj.id]['growthProxy'] = obj.growthProxy

					// Set up reference case and action case
					model.stocks.referenceCase.emissions[stock] 		= [] 
					model.stocks.referenceCase.energy[stock] 			= [] 
					model.stocks.referenceCase.emissionsAbated[stock] 	= [] 
					model.stocks.referenceCase.naturalVolume[stock] 	= [] 

					model.stocks.actionCase.emissions[stock] 			= [] 
					model.stocks.actionCase.energy[stock] 				= [] 
					model.stocks.actionCase.emissionsAbated[stock] 		= [] 
					model.stocks.actionCase.naturalVolume[stock] 		= [] 

					model.stocks.actionImpacts.byStock.emissions[stock] = [...Array(model.schema.reportTime.length)].map(d => 0)
					model.stocks.actionImpacts.byStock.energy[stock] 	= [...Array(model.schema.reportTime.length)].map(d => 0)
					model.stocks.actionImpacts.byStock.emissionsAbated[stock] 	= [...Array(model.schema.reportTime.length)].map(d => 0)
					model.stocks.actionImpacts.byStock.naturalVolume[stock] 	= [...Array(model.schema.reportTime.length)].map(d => 0)

					model.schema.time.yearArray.forEach(year => {
						model.stocks.referenceCase.emissions[stock].push(obj[year] > 0 ? obj[year] : 0)							// Gross emissions
						model.stocks.referenceCase.emissionsAbated[stock].push(obj[year] < 0 ? -obj[year] : 0)				    // Offsets and sinks 
						model.stocks.referenceCase.energy[stock].push(obj[year+"_TJ"])				
						model.stocks.referenceCase.naturalVolume[stock].push(obj[year+"_NU"])
					})
					// Set actionCase to start same as reference case					
					model.schema.reportTime.forEach(year => {
						model.stocks.actionCase.emissions[stock].push(obj[year] > 0 ? obj[year] : 0)	
						model.stocks.actionCase.emissionsAbated[stock].push(obj[year] < 0 ? -obj[year] : 0)	
						model.stocks.actionCase.energy[stock].push(obj[year+"_TJ"])							
						model.stocks.actionCase.naturalVolume[stock].push(obj[year+"_NU"])
					})		
				});

			// 2a. GET ACTION ID LIST AND objects for each action ID 			
				inputData.actionMetaInfo.forEach(obj => {
					model.stocks.actionImpacts.byAction[obj.id] = {
						emissions: 		{},
						energy:			{},
						emissionsAbated:	{},
						naturalVolume: 		{}
					}
				})
				model.actionList.allIDs	 = inputData.actionMetaInfo.map(d => d.id)

			// 2b. CREATE ACTION IMPACT DATA STRUCTURE
				inputData.actionStockImpacts.forEach( obj => {
					// a. Impacts by ACTION ID, stocktype and stockID
					model.stocks.actionImpacts.byAction["ACTION_"+obj.actionID_NZP]['emissions']["STOCK_"+obj.NZP.slice(4)] = []
					model.stocks.actionImpacts.byAction["ACTION_"+obj.actionID_NZP]['emissionsAbated']["STOCK_"+obj.NZP.slice(4)] = []

					if(obj.actionID_NZE){	model.stocks.actionImpacts.byAction["ACTION_"+obj.actionID_NZE]['energy']["STOCK_"+obj.NZE.slice(4)] = [] }
					if(obj.actionID_NU) {	model.stocks.actionImpacts.byAction["ACTION_"+obj.actionID_NU]['naturalVolume']["STOCK_"+obj.NU.slice(3)] = []}

					model.schema.reportTime.forEach( (year, i) => {
						// Emissions - Net emissions and action impacts (i.e. total impacts)
						model.stocks.actionImpacts.byAction["ACTION_"+obj.actionID_NZP]['emissions']["STOCK_"+obj.NZP.slice(4)].push(obj[year])
						model.stocks.actionImpacts.byStock.emissions["STOCK_"+obj.NZP.slice(4)][i] += obj[year]
						model.stocks.actionCase.emissions["STOCK_"+obj.NZP.slice(4)][i] -= obj[year] 		

						// For energy and natural unit if the rows exist
						if(obj.actionID_NZE){	
							model.stocks.actionImpacts.byAction["ACTION_"+obj.actionID_NZE]['energy']["STOCK_"+obj.NZE.slice(4)].push(obj[year+"_TJ"]) 
							model.stocks.actionImpacts.byStock.energy["STOCK_"+obj.NZE.slice(4)][i] += obj[year+"_TJ"]
							model.stocks.actionCase.energy["STOCK_"+obj.NZE.slice(4)][i] -= obj[year+"_TJ"]
						}
						if(obj.actionID_NU){ 
							model.stocks.actionImpacts.byAction["ACTION_"+obj.actionID_NU]['naturalVolume']["STOCK_"+obj.NU.slice(3)].push(obj[year+"_NU"]) 
							model.stocks.actionImpacts.byStock.naturalVolume["STOCK_"+obj.NU.slice(3)][i] += obj[year+"_NU"]
							model.stocks.actionCase.naturalVolume["STOCK_"+obj.NU.slice(3)][i] -= obj[year+"_NU"]
						}					
					})
				})

			// 3. AGGERGATE ACTION IMPACTS TO STOCK AND ACTION CASE LEVEL
			// console.log(Object.values(model.stocks.actionCase.emissions).reduce((r, a) => a.map((b, i) => (r[i] || 0) + b), []) )
			// console.log(Object.values(model.stocks.actionImpacts.byStock.emissions).reduce((r, a) => a.map((b, i) => (r[i] || 0) + b), []))

			// 4. CREATE ACTION BUSINESS CASES
				inputData.actionMetaInfo.forEach( actionData => {

					const modelLife = model.schema.reportTime.length,
						actionLife = actionData.actionLife
					
					// HROM Businss case structure: limited fields are replicated directly from Bass Coast model output; then added to/calcualted from actionStockImpacts data
			   		const businessCaseObject = {
			    			// Action meta information
			    			"About": {								// Object to hold hold meta-info about the action	
			    				"Action": {
			    					"modelType": 				'',
			    					'Title': 					actionData.name	,
			    					'Label': 					actionData.name	,
			    					'Type': 					actionData.modelType	,
			    					'Owner': 					actionData.ownerType	,
			    					"Description": {
			    						"General":  					actionData.descriptionGeneral,
			    						"Opportunity and target": 		'',
			    						"Finanical": 					'',
			    						"Technical notes": 				''
			    					}
			    				},
			    				"Target": {
			    					"Units": 					actionData.targetUnits 	
			    				},
			    				"Impact": 						{}
			    			},    		
			    			costCurveLabel:{
			    				dy: 						actionData.dy,
			    				dx: 						actionData.dx
			    			},							
			    			
			    			// Action parameters (unit-level)
			    			"Action parameters": {
				    			"Model time":  					[...Array(model.schema.reportTime.length).keys()],			
				    			"Action duration": 				actionData.actionLife,										
					    		"Discount factor": 				model.schema.reportTime.map(time =>  Math.pow((1 + actionData.wacc), time))		
			    			}, 			

				    		// System-level uptake
				    		"Uptake": {										
				    			"Baseline": {					// Holds calculated opportunity size (the 'technical' limit) and target size (the 'viable' & expected ('desirable') limit. Assumes 100% uptake immediately	
				    				"Opportunity": 				[...Array(model.schema.reportTime.length)].map(d => actionData.opportunitySize), 	
				    				"Target": 					[...Array(model.schema.reportTime.length)].map(d => actionData.targetSize)
				    			},
				    			"Modelled": 					{
				    				"Proportions": 				model.schema.time.yearArray.map(time => actionData["uptake_"+time] ? actionData["uptake_"+time] : 1),
				    				"Value": 					model.schema.time.yearArray.map(time => actionData["uptake_"+time] ? (actionData["uptake_"+time] * actionData.targetSize) : actionData.targetSize)

				    			}		// Holds the old modelled uptake pathways (as proportions over time) and the total units implemented by year
				    		},

			    			// System level stocks impacts BEFORE applying modelled uptake    			
			    			"Raw system impacts": {						// Object to hold a set of stock impact items (over time), for the:
			    				"Action case": 					{},			// action case
			    				"Reference case": 				{},			// reference case and
			    				"Marginal impact": 				{} 			// marginal impact case 
			    			},

			    			// System level stock impacts by case type WITH modelled uptake    			
			    			"System impacts": {						// Object to hold a set of grouped stock impact items items (over time), for the:
			    				"Action case": 					{},			// action case
			    				"Reference case": 				{},			// reference case and
			    				"Marginal impact": {						// marginal impact case 
			    					"emissions": {
			    						"value": 				Object.values(model.stocks.actionImpacts.byAction[actionData.id]['emissions']).reduce((r, a) => a.map((b, i) => (r[i] || 0) + b), []).map( d => -d)
			    					},
			    					"energy": {
			    						"value": 				Object.values(model.stocks.actionImpacts.byAction[actionData.id]['energy']).reduce((r, a) => a.map((b, i) => (r[i] || 0) + b), []).map( d => -d)
			    					},	    					
			    					"naturalVolume": {
			    						"value": 				Object.values(model.stocks.actionImpacts.byAction[actionData.id]['naturalVolume']).reduce((r, a) => a.map((b, i) => (r[i] || 0) + b), []).map( d => -d)
			    					}
			    				} 			
			    			},

			    			// Unit level stock impacts by case type 			
			    			"Unit impacts": {						// Object to hold a set of grouped stock impact items items (over time), for the:
			    				"Action case": 					{},			// action case
			    				"Reference case": 				{},			// reference case and
			    				"Marginal impact": 				{} 			// marginal impact case 
			    			},

			    			// Summary metrics (per unit)
			    			"Summary metrics (per unit)": {					// Object to hold a set of Summary metrics (per unit) 
			    				"Financial": {
			    					"Net upfront expenditure":  		actionData.levelisedCost,	// Net expenditure initiated 
			    					"Net recurring expenditure":  		0	// to zero and added cumulatively (programmatically)
			    				},
			    				"System stocks": {					
			    					"Net change": 			{},		// Object to hold impact metrics on stocks 
			    					"NPV": 					{}		// and stock NPV calculations
			    				},
			    				"Levelised cost": {						// Object to hold levelised costs by stock type
			    					"emissions": 						actionData.levelisedCost, 		
			    					"emissionsAbated": 					actionData.abatement, 		
			    					"energy": 							actionData.levelisedCostEnergy 		
			    				},									
			    				"Annualised impact": {					// Object to hold annualised impact by stock type
			    					"emissions": 						actionData.levelisedCost, 		
			    					"emissionsAbated": 					actionData.abatement, 		
			    					"energy": 							actionData.levelisedCostEnergy 		
			    				}									
			    			},

			    			// Summary metrics (system wide)
			    			"Summary metrics (system-wide)": {			// Object to hold a set of Summary metrics (per unit) 
			    				"Financial": {
			    					"Net upfront expenditure":  	0,	// Net expenditure initiated 
			    					"Net recurring expenditure":  	0	// to zero and added cumulatively (programmatically)
			    				},
			    				"System stocks": {					
			    					"Net change": 			{},		// Object to hold impact metrics on stocks 
			    					"NPV": 					{}		// and stock NPV calculations
			    				},
			    				"Levelised cost": 			{},		// Object to hold levelised costs by stock type
			    				"Annualised impact": 		{}		// Object to hold annualised impact by stock type
			    			},

			    			// Dynamic interface variables
			    			"Dynamics":  					{}		// Object to hold the calculated / updated dynamic variables used in the interface
			    	}

		    		// Shortcut references to business case objects: 
		    		const parameters 	 	= businessCaseObject["Action parameters"],
		    			uptake 			 	= businessCaseObject['Uptake'],
		    			uptakeBaseCase 	 	= businessCaseObject['Uptake']['Baseline'],
		    			rawSystemImpacts 	= businessCaseObject["Raw system impacts"],
		    			unitImpacts 		= businessCaseObject["Unit impacts"],
		    			systemImpacts 	 	= businessCaseObject["System impacts"],
		    			financialImpacts 	= businessCaseObject["Financial impacts"],
		    			cfItems 		 	= businessCaseObject["Cash flow items"],
		    			metricsFinancial 	= businessCaseObject["Summary metrics (per unit)"]["Financial"],
		    			summaryMetrics   	= businessCaseObject["Summary metrics (per unit)"],
		    			metaInfo 		 	= businessCaseObject["About"],
		    			dynamicVariables 	= businessCaseObject["Dynamics"]

		    		// Get mnodelled uptake rate
		    		const uptakeRate = []

		    		// Set object
					model.actionBusinessCase[actionData.id] = businessCaseObject
				})


	    	// i. Return empty resolve function for promise (to chain)
			console.log('Pathways data parsed..')
		return resolve()
	 	}) // end Promise executor function
	}; // end transformPathwayData()


    function createInterface(){
    	d3.select('#penguins').attr('d', penguin1path).style('opacity', 0).transition().duration(1000).style('opacity', null)
    	d3.select('#activityDescription-close').on('click', () => { d3.select('#activityDescription-container').classed('onscreen', false) })

    	d3.select('#menu-profile').classed('selected', true)
    	d3.selectAll('.vis-container').classed('hidden', true).classed('faded', false)
    	d3.select('#baseline-vis-profileChart-container').classed('hidden', false)
    	// Add vis switching
    	d3.selectAll('.menu-option').on('click', function(){
			d3.selectAll('.menu-option').classed('selected', false)
    		d3.select(this).classed('selected', true)
			d3.selectAll('.vis-container').classed('hidden', true).style('display', null)
			d3.select('#'+this.getAttribute('vis')+'-container').classed('hidden', false).style('display', 'grid').style('opacity', 0)
				.transition().duration(500).style('opacity', 1)
			movePenguins(this.id)
		})
    }; // end createInterface()


    function movePenguins(id){
        switch(id) {
            case 'menu-profile':
                d3.select('#penguin-container')
                    .style('left', null)
                    .style('bottom', null)     
                 renderBaselineChart()
                break
            case 'menu-breakdown':
                d3.select('#penguin-container')
                    .style('left', '13%')
                    .style('bottom', '5%')     
                renderBubbleVis() 
                break
            case 'menu-flow':
                d3.select('#penguin-container')
                    .style('left', '-2%')
                    .style('bottom', '7.5%')        
                renderSankey()                    
                break
            case 'menu-wedges':
                d3.select('#penguin-container')
                    .style('left', '-5%')
                    .style('bottom', '35%')  
                renderWedgesChart()                                               
                break
            case 'menu-costCurve':
                d3.select('#penguin-container')
                    .style('left', '-3%')
                    .style('bottom', '25%')
                renderCostCurve()              
                break
        }
    }; // end movePenguins()
