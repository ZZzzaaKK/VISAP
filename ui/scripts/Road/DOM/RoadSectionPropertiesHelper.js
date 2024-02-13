const createRoadSectionPropertiesHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRoadSectionPropsMap = new Map();

        /************************
            Public Functions
        ************************/

        // returns a props map for individual roadSections where startElement serves as reference for every attribute
        function getRoadObjSectionPropertiesArr(startElementComponent, relatedRoadObjsMap) {
            globalStartElementComponent = startElementComponent;
            const roadObjAdjustedArr = getRoadObjAdjustedArr(relatedRoadObjsMap);
            return roadObjAdjustedArr;
        }

        function getRoadObjAdjustedArr(relatedRoadObjsMap) {
            let roadObjAdjustedArr = getRoadObjsWithAdjustedRoadSectionOrder(relatedRoadObjsMap);
            addDirectionOfRoadSectionsRelativeToStartElement(roadObjAdjustedArr);
            addIntersectionCoordinates(roadObjAdjustedArr);
            addBorderIntersectionForInitialAndFinalRoadSection(roadObjAdjustedArr);
            console.log(roadObjAdjustedArr)
            return roadObjAdjustedArr;
        }

        function getRoadObjsWithAdjustedRoadSectionOrder(relatedRoadObjsMap) {
            const roadObjsInCallsRelation = getRoadObjsInCallsRelation(relatedRoadObjsMap);
            const roadObjsInIsCalledRelation = getRoadObjsInIsCalledRelation(relatedRoadObjsMap);
            const reversedIsCalledRoadObjs = roadObjsInIsCalledRelation.map(roadObj => ({
                ...roadObj,
                roadSectionObjArr: [...roadObj.roadSectionObjArr].reverse(),
            }));
            const roadObjAdjustedArr = [...roadObjsInCallsRelation, ...reversedIsCalledRoadObjs];
            return roadObjAdjustedArr;
        }

        function addIntersectionCoordinates(roadObjAdjustedArr) {
            roadObjAdjustedArr.forEach(roadObj => {
                for (let i = 1; i < roadObj.roadSectionObjArr.length; i++) {
                    const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                    const refRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
                    // a curve
                    if (currentRoadSectionObj.direction != refRoadSectionObj.direction) {
                        currentRoadSectionObj.intersection, refRoadSectionObj.intersection
                            = getIntersectionCoordinates(currentRoadSectionObj, refRoadSectionObj)
                    } else refRoadSectionObj.intersection = null;
                }
                const lastRoadSection = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 1];
                lastRoadSection.intersection = null;
            })
        }

        function addDirectionOfRoadSectionsRelativeToStartElement(roadObjAdjustedArr) {
            roadObjAdjustedArr.forEach(roadObj => {
                const refRoadSectionObj = roadObj.roadSectionObjArr[0];
                const refDirection = getDirectionForInitialRoadSection(refRoadSectionObj);
                roadObj.roadSectionObjArr[0].direction = refDirection;
                for (let i = 1; i < roadObj.roadSectionObjArr.length; i++) {
                    const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                    const refRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
                    const currentDirection = getDirectionOfAdjacentRoadSections(currentRoadSectionObj, refRoadSectionObj);
                    roadObj.roadSectionObjArr[i].direction = currentDirection;
                }
            })
        }

        function addBorderIntersectionForInitialAndFinalRoadSection(roadObjAdjustedArr) {
            roadObjAdjustedArr.forEach(roadObj => {
                const length = roadObj.roadSectionObjArr.length;
                for (let i = 0; i < length; i++) {
                    let intersectionWithStartBorder = null;
                    let intersectionWithEndBorder = null;
                    if (i === 0) intersectionWithStartBorder = getCoordinatesForStartEndElementIntersection(roadObj.roadSectionObjArr[i]);
                    if (i === length - 1) intersectionWithEndBorder = getCoordinatesForStartEndElementIntersection(roadObj.roadSectionObjArr[i], isFinal = true);

                    roadObj.roadSectionObjArr[i].intersectionWithStartBorder = intersectionWithStartBorder;
                    roadObj.roadSectionObjArr[i].intersectionWithEndBorder = intersectionWithEndBorder;
                }
            });
        }

        /************************
               3D Helper
        ************************/

        function getDirectionForInitialRoadSection(initialRoadSectionObj) {
            // initial roadSections direction is based on startElement position
            // this also included isCalled roads, as their order gets reversed to keep startElement as reference
            const initialRoadSectionMidPoint = document.getElementById(initialRoadSectionObj.id).getAttribute("position");
            const startElementMidPoint = globalStartElementComponent.getAttribute("position");
            const directionMap = {
                east: initialRoadSectionMidPoint.x < startElementMidPoint.x,
                west: initialRoadSectionMidPoint.x > startElementMidPoint.x,
                north: initialRoadSectionMidPoint.z > startElementMidPoint.z,
                south: initialRoadSectionMidPoint.z < startElementMidPoint.z,
            };
            const direction = Object.keys(directionMap).find(key => directionMap[key]);
            return direction;
        }

        function getDirectionOfAdjacentRoadSections(currentRoadSectionObj, refRoadSectionObj) {
            const refDirection = refRoadSectionObj.direction;
            const currentMidPoint = document.getElementById(currentRoadSectionObj.id).getAttribute("position");
            const refMidPoint = document.getElementById(refRoadSectionObj.id).getAttribute("position");
            // imagine a compass turning its needle based on your direction: here, assigned directions depend on reference directions
            switch (refDirection) {
                case "west":
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z === refMidPoint.z) return "west";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "north";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "south";
                    break;

                case "east":
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z === refMidPoint.z) return "east";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "north";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "south";
                    break;

                case "south":
                    if (currentMidPoint.x === refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "south";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "west";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "east";
                    break;

                case "north":
                    if (currentMidPoint.x === refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "north";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "west";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "east";
                    break;
            }
        }

        function getIntersectionCoordinates(currentRoadSectionObj, refRoadSectionObj) {
            const currentComponent = document.getElementById(currentRoadSectionObj.id);
            const predecessorComponent = document.getElementById(refRoadSectionObj.id);

            const currentPos = currentComponent.getAttribute("position");
            const predecessorPos = predecessorComponent.getAttribute("position");

            const currentWidth = currentComponent.getAttribute("width");
            const currentDepth = currentComponent.getAttribute("depth");

            const predecessorWidth = predecessorComponent.getAttribute("width");
            const predecessorDepth = predecessorComponent.getAttribute("depth");

            // calculate extents of rectangles in both directions
            const currentLeftX = currentPos.x - currentWidth / 2;
            const currentRightX = currentPos.x + currentWidth / 2;
            const currentTopZ = currentPos.z - currentDepth / 2;
            const currentBottomZ = currentPos.z + currentDepth / 2;

            const predecessorLeftX = predecessorPos.x - predecessorWidth / 2;
            const predecessorRightX = predecessorPos.x + predecessorWidth / 2;
            const predecessorTopZ = predecessorPos.z - predecessorDepth / 2;
            const predecessorBottomZ = predecessorPos.z + predecessorDepth / 2;

            // calculate intersection region
            const intersectionLeftX = Math.max(currentLeftX, predecessorLeftX);
            const intersectionRightX = Math.min(currentRightX, predecessorRightX);
            const intersectionTopZ = Math.max(currentTopZ, predecessorTopZ);
            const intersectionBottomZ = Math.min(currentBottomZ, predecessorBottomZ);

            // Calculate midpoint of intersection region
            const intersectionMidpointX = (intersectionLeftX + intersectionRightX) / 2;
            const intersectionMidpointZ = (intersectionTopZ + intersectionBottomZ) / 2;

            const intersectionMidpoint = { x: intersectionMidpointX, z: intersectionMidpointZ };

            return intersectionMidpoint;
        }

        function getCoordinatesForStartEndElementIntersection(roadSectionObj, isFinal = false) {
            const direction = roadSectionObj.direction;
            const width = document.getElementById(roadSectionObj.id).getAttribute("width");
            const depth = document.getElementById(roadSectionObj.id).getAttribute("depth");
            const position = document.getElementById(roadSectionObj.id).getAttribute("position");

            let delta;

            switch (direction) {
                case "west": {
                    isFinal ? delta = width / 2 : delta = - width / 2
                    return {
                        x: position.x + delta,
                        z: position.z,
                    }
                }
                case "east": {
                    isFinal ? delta = width / 2 : delta = - width / 2
                    return {
                        x: position.x - delta,
                        z: position.z,
                    }
                }
                case "south": {
                    isFinal ? delta = depth / 2 : delta = - depth / 2
                    return {
                        x: position.x,
                        z: position.z - delta,
                    }
                }
                case "north": {
                    isFinal ? delta = depth / 2 : delta = - depth / 2
                    return {
                        x: position.x,
                        z: position.z + delta,
                    }
                }
            }
        }

        /************************
             Other Helper
        ************************/

        function getRoadObjsInCallsRelation(relatedRoadObjsMap) {
            return Array.from(relatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId === globalStartElementComponent.id); // startElement calls other elements
        }

        function getRoadObjsInIsCalledRelation(relatedRoadObjsMap) {
            return Array.from(relatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id); // startElement is called by other elements
        }

        return {
            getRoadObjSectionPropertiesArr,
        };
    })();
};