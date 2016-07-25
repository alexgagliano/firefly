var viewPanel
var starArray = new Array()
var controlKit

porthole.connected = function() {
    controlKit = new ControlKit();
    controlKit.addPanel({label: 'Star Group Settings' , fixed: false, width: 320});
    console.log(controlKit)
    viewPanel = controlKit._panels[0]
    console.log(viewPanel)
}

var numStarPanels = 0
var currentColors = new Array()
var currentFilterSettings = new Array()
var currentColorSettings = new Array()
var currentVariableColor = new Array(10)
var currentVariableFilter = new Array(10)
var groupNames = new Array(10)
var refresh = false
var colorMapLabels = new Array(10)
var colorMapArray = new Array(10)

////////////////////////////////////////////////////////////////////////////////
function setColorMapArrays( cm, cml) {
    colorMapArray = cm
    colorMapLabels = cml
}

////////////////////////////////////////////////////////////////////////////////
function addStarPanel(name) {
    {{py print "In star panel function"}}
    var obj = {
        colorRange : [0,1],
        filterRange : [-1,1],
        minVal : 0.2,
        maxVal : 0.8,
        filterOn: false,
        isLog: false,
        variables : ['Smoothing Length', 'Density', 'Internal Energy', 'Formation Rate'],
        colors : colorMapLabels,
        xPos : 0,
        yPos : 0
    };
    starArray.push(obj)
    groupNames[numStarPanels] = name
    currentFilterSettings[numStarPanels] = new Array(10)
    currentFilterSettings[numStarPanels].fill(0)
    currentColorSettings[numStarPanels] = new Array(10)
    currentColorSettings[numStarPanels].fill(0)

    var currIndex = numStarPanels
    viewPanel.addGroup({label: name, enable: false})
        .addSubGroup({label: 'Color Settings', enable: false})
            .addSelect(starArray[numStarPanels], 'variables' , {label: 'Variable', onChange: function (index) {
                updateTables()
                currentVariableColor[currIndex] = index
                console.log(currentVariableColor[currIndex])
                if (currentColorSettings[currIndex][index] == 0) {
                    currentColorSettings[currIndex][index]= {
                        on : false,
                        min : 0.0,
                        max : 1.0
                    }
                    starArray[currIndex].isLog = currentColorSettings[currIndex][index].on
                    starArray[currIndex].colorRange = [currentColorSettings[currIndex][index].min, currentColorSettings[currIndex][index].max]
                } else {
                    console.log(currentColorSettings[currIndex])
                    console.log('current Value', starArray[currIndex].isLog )
                    console.log('saved Value', currentColorSettings[currIndex][index].on)

                    console.log('new Value',starArray[currIndex].isLog )

                    starArray[currIndex].isLog = currentColorSettings[currIndex][index].on
                    starArray[currIndex].colorRange = [currentColorSettings[currIndex][index].min, currentColorSettings[currIndex][index].max]
                }
                controlKit.update();
                {{py setColorVariable("%starArray[currIndex].variables[index]%","%groupNames[currIndex]%")}}
            }})
            .addSelect(starArray[numStarPanels], 'colors', {label: 'Colors', onChange: function (index) {
                // currentColors[numStarPanels] = index
                // obj.funcTarget = obj.funcs[index];
                console.log('color map changed')
                {{py setColorMap("%colorMapArray[index]%","%groupNames[currIndex]%")}}
            }})
            .addRange(starArray[numStarPanels],'colorRange',{label : 'Range:'})
            .addCheckbox(starArray[numStarPanels], 'isLog', {label: 'Log Scale'})
        .addSubGroup({label: 'Filter Settings', enable: false})
            .addSelect(starArray[numStarPanels], 'variables', {label: 'Variable', onChange: function (index) {
                updateTables()
                currentVariableFilter[currIndex] = index
                if (currentFilterSettings[currIndex][index] == 0) {
                    console.log('new')
                    currentFilterSettings[currIndex][index]= {
                        on : false,
                        min : -1.0,
                        max : 1.0
                    }
                    starArray[currIndex].filterOn = currentFilterSettings[currIndex][index].on
                    starArray[currIndex].filterRange = [currentFilterSettings[currIndex][index].min, currentFilterSettings[currIndex][index].max]
                } else {
                    starArray[currIndex].filterOn = currentFilterSettings[currIndex][index].on
                    starArray[currIndex].filterRange = [currentFilterSettings[currIndex][index].min, currentFilterSettings[currIndex][index].max]
                    console.log(starArray[currIndex].filterOn)
                }
                // obj.funcTarget = obj.funcs[index];
                controlKit.update();
            }})
            .addCheckbox(starArray[numStarPanels], 'filterOn', {label: 'Filter On'})
            .addRange(starArray[numStarPanels],'filterRange',{label : 'Range:'})
        .addSubGroup({label: 'Information'})
            .addNumberOutput(starArray[numStarPanels], 'xPos', {label: 'Val 1:'})
            .addNumberOutput(starArray[numStarPanels], 'yPos', {label: 'Val 2:'})
    {{py print "Now done"}}
    numStarPanels = numStarPanels + 1
}

////////////////////////////////////////////////////////////////////////////////
function update(){
    for (var i = currentFilterSettings.length - 1; i >= 0; i--) {    
        {{py setColorRange(%starArray[i].filterRange[0]%, %starArray[i].filterRange[1]%,"%groupNames[i]%")}}
        for (var j = starArray[i].variables.length - 1; j >= 0; j--) {
            if (currentFilterSettings[i][j] && starArray[i].filterOn){
                {{py setFilter(%currentFilterSettings[i][j].min%,%currentFilterSettings[i][j].max%, %starArray[i].variables[j]%, "%groupNames[i]%")}}
            }
        }
        {{setLog(%starArray[i].isLog%,"%groupNames[i]%")}}
    }
    requestAnimationFrame(update);
}

////////////////////////////////////////////////////////////////////////////////
function updateTables() {
    for (var i = currentFilterSettings.length - 1; i >= 0; i--) {
        // console.log(currentVariableColor)
        var j = currentVariableColor[i]
        console.log(j)
        console.log(currentFilterSettings[i][j])
        if (currentColorSettings[i][j]){
            currentColorSettings[i][j].on = starArray[i].isLog
            console.log('saving new value:', currentColorSettings[i][j].on )
            currentColorSettings[i][j].min = starArray[i].colorRange[0]
            currentColorSettings[i][j].max = starArray[i].colorRange[1]
        }
        j = currentVariableFilter[i]
        if (currentFilterSettings[i][j]) {

            currentFilterSettings[i][j].on = starArray[i].filterOn
            console.log("saving value", currentFilterSettings[i][j].on)
            currentFilterSettings[i][j].min = starArray[i].filterRange[0]
            currentFilterSettings[i][j].max = starArray[i].filterRange[1]
        }
    }
}

