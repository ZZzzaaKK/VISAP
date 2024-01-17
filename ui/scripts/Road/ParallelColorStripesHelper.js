const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let domHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionRotationMap = new Map();
        const globalScene = document.querySelector("a-scene");


        /************************
            Public Functions
        ************************/

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                domHelper = createDomHelper(controllerConfig);
                domHelper.initialize();
                domHelper.createLegend(
                    [
                        { text: "calls", color: controllerConfig.colorsParallelColorStripes.calls },
                        { text: "isCalled", color: controllerConfig.colorsParallelColorStripes.isCalled },
                    ]);
            }
        }

        function highlightRelatedRoadsForStartElement(startElementComponent, relatedObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedObjsMap;

            domHelper.handleLegendForAction("select");
            setRoadSectionRotationMap();
            handleRoadStripsCreation();
        }

        function resetRoadsHighlight() {
            domHelper.handleLegendForAction("unselect");
            domHelper.removeComponentByIdMarking("_stripe");
        }

        /************************
           Road Section States
        ************************/

        function setRoadSectionRotationMap() {
            setRotationForRoadSectionsCalls()
            setRotationForRoadSectionsIsCalled()  // const roadObjsWhereGlobalStartElementIsDestination = getRoadObjsWhereGlobalStartElementIsDestination();

        }

        function setRotationForRoadSectionsCalls() {
            const roadObjsForGlobalStartElement = getRoadObjsForGlobalStartElement();
            roadObjsForGlobalStartElement.forEach(roadObj => {
                setRotationForStartRamp(roadObj);
            })
        }

        // start calls other elements
        function getRoadObjsForGlobalStartElement() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId === globalStartElementComponent.id);
        }

        // other elements call start
        function getRoadObjsWhereGlobalStartElementIsDestination() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id);
        }

        function setRotationForStartRamp(roadObj) {
            road
        }

        function addRelationsToRoadSectionRelationMap(elementIdArr, relation, roadSectionIdsAllRelationsMap) {
            elementIdArr.forEach(elementId => {
                const roadSectionIds = roadModel.getRoadSectionIdsForUniqueElementIdRelation(elementId, globalStartElementComponent.id)
                roadSectionIds.forEach(roadSectionId => {
                    if (!roadSectionIdsAllRelationsMap.has(roadSectionId)) {
                        roadSectionIdsAllRelationsMap.set(roadSectionId, [relation]);
                    } else {
                        roadSectionIdsAllRelationsMap.get(roadSectionId).push(relation);
                    }
                });
            })
        }

        /************************
                Stripes
        ************************/

        function handleRoadStripsCreation() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnStripesForRoadObj(roadObj);
                if (controllerConfig.spawnTrafficSigns) spawnTrafficSigns();
            })
        }

        function spawnStripesForRoadObj(roadObj) {
            roadObj.roadSectionArr.forEach(roadSectionId => {
                if (globalRoadSectionStateMap.get(roadSectionId)) {
                    const stripeId = roadSectionId + "_stripe"; // marking string to later handle related components
                    stripeComponent = createStripeComponent(stripeId);
                    setStripeComponentProperties(stripeComponent, roadObj, roadSectionId);
                    globalScene.appendChild(stripeComponent);
                }
            })
        }

        function createStripeComponent(stripeId) {
            const stripeComponent = document.createElement("a-entity");
            stripeComponent.setAttribute("id", stripeId);
            return stripeComponent;
        }

        // setting properties based on roadSection components the stripes will flow above
        function setStripeComponentProperties(stripeComponent, roadObj, roadSectionId) {
            roadSectionComponent = document.getElementById(roadSectionId)

            const originalPosition = roadSectionComponent.getAttribute("position");
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");

            const isStartRamp = determineIfRoadSectionIsStartRamp(roadObj, roadSectionId)
            const isEndRamp = determineIfRoadSectionIsEndRamp(roadObj, roadSectionId)

            isStartRamp || isEndRamp ? offsetY = 0.51 : offsetY = 0.50; // small offset for ramps so they lie above undecided colors
            const stripePosition = { x: originalPosition.x, y: originalPosition.y + offsetY, z: originalPosition.z };
            stripeComponent.setAttribute("position", stripePosition);
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${originalWidth - 0.5}; height: 0.1; depth: ${originalDepth - 0.5}`);
            const color = determineColorOfRoadSectionIdByState(roadSectionId)
            stripeComponent.setAttribute("material", `color: ${color}`);
            return stripeComponent;
        }

        // startRamp: first roadSection of a road
        function determineIfRoadSectionIsStartRamp(roadObj, roadSectionId) {
            return roadObj.roadSectionArr.length > 0 && roadObj.roadSectionArr[0] === roadSectionId;
        }

        // endRamp = last roadSection of a road
        function determineIfRoadSectionIsEndRamp(roadObj, roadSectionId) {
            return roadObj.roadSectionArr.length > 0 && roadObj.roadSectionArr[roadObj.roadSectionArr.length - 1] === roadSectionId;
        }

        function determineColorOfRoadSectionIdByState(roadSectionId) {
            const state = globalRoadSectionStateMap.get(roadSectionId);
            return controllerConfig.colorsMultiColorStripes[state];
        }

        return {
            initialize,
            highlightRelatedRoadsForStartElement,
            resetRoadsHighlight,
        };
    })();
};