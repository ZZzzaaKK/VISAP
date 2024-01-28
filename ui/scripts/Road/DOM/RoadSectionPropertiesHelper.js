const createRoadSectionPropertiesHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRelatedRoadObjsMap;
        let globalRoadSectionPropsMap = new Map();
        let globalIntersectionMap = new Map();

        /************************
            Public Functions
        ************************/

        // returns a props map for individual roadSections where startElement serves as reference for every attribute
        function getPropsMapForRelatedRoadsStartElementPOV(startElementComponent, relatedRoadObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedRoadObjsMap;
            setRoadSectionPropertiesMap();
            console.log(globalRoadSectionPropsMap)
            return globalRoadSectionPropsMap;
        }

        /************************
             Enriching Props
        ************************/

        function createRoadSectionPropertiesObj(p = {}) {
            // augment as needed and set values in 'setRoadSectionPropertiesMap'
            const roadSectionPropsObj = {
                elementOrigin: p.elementOrigin || null,
                isInitialElement: p.isStartRamp || false,
                isFinalElement: p.isEndRamp || false,
                direction: p.direction || null,
                directionOfSuccessor: p.directionOfSuccessor || null,
                directionOfPredecessor: p.directionOfPredecessor || null,
                isStartingInCurve: p.isStartingInCurve || false,
                isEndingInCurve: p.isEndingInCurve || false,
            };
            return roadSectionPropsObj;
        }

        function setRoadSectionPropertiesMap() {
            //basic ops
            resetCurrentRoadSectionPropsMap();
            addAllRelevantRoadSectionsToMapWithEmptyProps();
            // calls
            setPropsForInitialRoadSectionsInCallsRelation();
            setDirectionsForSubsequentRoadSectionsInCallsRelation();
            // isCalled
            setPropsForInitialRoadSectionsInIsCalledRelation()
            setDirectionsForSubsequentRoadSectionsInIsCalledRelation();
            // further props
            setIsFinalElementForAllRoadSections();
            setCurvePropsForAllRoadSections();
            getIntersections()
        }

        function resetCurrentRoadSectionPropsMap() {
            globalRoadSectionPropsMap.clear();
        }

        function addAllRelevantRoadSectionsToMapWithEmptyProps() {
            const allRoadObjs = [...getRoadObjsInCallsRelation(), ...getRoadObjsInIsCalledRelation()];

            allRoadObjs.forEach(roadObj => {
                roadObj.roadSectionArr.forEach(roadSectionId => {
                    const defaultPropertiesObj = createRoadSectionPropertiesObj({});
                    addToMapIfKeyOrValueNotExists(roadSectionId, defaultPropertiesObj, globalRoadSectionPropsMap);
                });
            });
        }

        /************************
                Calls
        ************************/

        function getIntersections() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                let roadSectionArr = roadObj.startElementId != globalStartElementComponent.id
                    ? [...roadObj.roadSectionArr].reverse()
                    : roadObj.roadSectionArr;

                for (let i = 1; i < roadSectionArr.length; i++) {
                    current = roadSectionArr[i];
                    predecessor = roadSectionArr[i - 1];
                    const directionOfCurrent = globalRoadSectionPropsMap.get(current).direction;
                    const directionOfPredecessor = globalRoadSectionPropsMap.get(predecessor).direction;
                    if (directionOfCurrent != directionOfPredecessor) {
                        calculateIntersection(current, predecessor)
                    }
                }
            })
        }

        function calculateIntersection(current, predecessor) {
            const currentComponent = document.getElementById(current);
            const predecessorComponent = document.getElementById(predecessor);

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

            const randomNumber = Math.floor(Math.random() * 100000) + 1;
            globalIntersectionMap.set(randomNumber, intersectionMidpoint)
            drawLinesBetweenSpheres()
            console.log(globalIntersectionMap)
        }

        function drawSpheresOnMidpoints() {
            const scene = document.querySelector('a-scene'); // Replace 'a-scene' with your actual scene selector
            const sphereRadius = 0.2; // Adjust the radius of the spheres as needed

            globalIntersectionMap.forEach(intersectionMidpoint => {
                const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);

                const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

                const sphere = new THREE.Mesh(geometry, material);

                sphere.position.set(intersectionMidpoint.x, 1, intersectionMidpoint.z);

                scene.object3D.add(sphere);
            });
        }


        function drawLinesBetweenSpheres() {
            const scene = document.querySelector('a-scene'); // Replace 'a-scene' with your actual scene selector
            const sphereRadius = 0.2; // Adjust the radius of the spheres as needed
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });

            let previousIntersection;

            globalIntersectionMap.forEach((intersectionMidpoint, intersectionId) => {
                const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);

                const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

                sphere.position.set(intersectionMidpoint.x, 1, intersectionMidpoint.z);

                scene.object3D.add(sphere);

                if (previousIntersection) {
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 0.1 });
                    const lineGeometry = new THREE.Geometry();
                    lineGeometry.vertices.push(
                        new THREE.Vector3(previousIntersection.x, 1, previousIntersection.z),
                        new THREE.Vector3(intersectionMidpoint.x, 1, intersectionMidpoint.z)
                    );

                    const line = new THREE.Line(lineGeometry, lineMaterial);

                    scene.object3D.add(line);
                }

                previousIntersection = intersectionMidpoint;
            });
        }










        /****** */

        function setPropsForInitialRoadSectionsInCallsRelation() {
            const roadObjsInCallsRelation = getRoadObjsInCallsRelation();
            roadObjsInCallsRelation.forEach(roadObj => {
                const initialRoadSectionId = roadObj.roadSectionArr[0];
                const direction = getDirectionForInitialRoadSection(initialRoadSectionId);
                addToMapIfKeyOrValueNotExists(initialRoadSectionId, {
                    elementOrigin: roadObj.startElementId,
                    direction,
                    isInitialElement: true,
                }, globalRoadSectionPropsMap)
            })
        }

        function setDirectionsForSubsequentRoadSectionsInCallsRelation() {
            const roadObjsInCallsRelation = getRoadObjsInCallsRelation();
            roadObjsInCallsRelation.forEach(roadObj => {
                const directions = getDirectionsForOrderedRoadSections(roadObj.roadSectionArr);
                for (let i = 1; i < roadObj.roadSectionArr.length; i++) {
                    addToMapIfKeyOrValueNotExists(roadObj.roadSectionArr[i], {
                        elementOrigin: roadObj.startElementId,
                        direction: directions[i]
                    }, globalRoadSectionPropsMap)
                }
            })
        }

        /************************
                isCalled
        ************************/

        function setPropsForInitialRoadSectionsInIsCalledRelation() {
            const roadObjsInIsCalledRelation = getRoadObjsInIsCalledRelation();

            roadObjsInIsCalledRelation.forEach(roadObj => {
                // last roadSection serves as initialElement – as in isCalled-relations, roads get flipped to keep startElement as reference
                const lastIdx = roadObj.roadSectionArr.length - 1;
                const initialRoadSectionId = roadObj.roadSectionArr[lastIdx];
                const direction = getDirectionForInitialRoadSection(initialRoadSectionId);
                addToMapIfKeyOrValueNotExists(initialRoadSectionId, {
                    elementOrigin: roadObj.startElementId,
                    direction,
                    isInitialElement: true,
                }, globalRoadSectionPropsMap)
            })
        }

        function setDirectionsForSubsequentRoadSectionsInIsCalledRelation() {
            const roadObjsInIsCalledRelation = getRoadObjsInIsCalledRelation();
            roadObjsInIsCalledRelation.forEach(roadObj => {
                // reversing road – as in isCalled-relations, roads get flipped to keep startElement as reference
                const reverseOrderedArr = [...roadObj.roadSectionArr].reverse();
                const directions = getDirectionsForOrderedRoadSections(reverseOrderedArr);
                for (let i = 1; i < roadObj.roadSectionArr.length; i++) {
                    addToMapIfKeyOrValueNotExists(reverseOrderedArr[i], {
                        elementOrigin: roadObj.startElementId,
                        direction: directions[i]
                    }, globalRoadSectionPropsMap)
                }
            })
        }

        /************************
             Directions Ops
        ************************/

        function getDirectionForInitialRoadSection(initialRoadSectionId) {
            // initial roadSections direction is based on startElement position
            // this also included isCalled roads, as their order gets reversed to keep startElement as reference
            const midPointOfInitialRoadSection = document.getElementById(initialRoadSectionId).getAttribute("position");
            const startElementMidPoint = globalStartElementComponent.getAttribute("position");
            const directionMap = {
                east: midPointOfInitialRoadSection.x < startElementMidPoint.x,
                west: midPointOfInitialRoadSection.x > startElementMidPoint.x,
                north: midPointOfInitialRoadSection.z > startElementMidPoint.z,
                south: midPointOfInitialRoadSection.z < startElementMidPoint.z,
            };
            const direction = Object.keys(directionMap).find(key => directionMap[key]);
            return direction;
        }

        function getDirectionsForOrderedRoadSections(roadSectionOrderedArr) {
            let directionsArr = [];
            directionsArr.push(globalRoadSectionPropsMap.get(roadSectionOrderedArr[0]).direction)
            for (let i = 1; i < roadSectionOrderedArr.length; i++) {
                const midPoint = document.getElementById(roadSectionOrderedArr[i]).getAttribute("position");
                const refMidPoint = document.getElementById(roadSectionOrderedArr[i - 1]).getAttribute("position");
                const refDirection = directionsArr[i - 1];
                const direction = getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection);
                directionsArr.push(direction);
            }
            return directionsArr;
        }

        function getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection) {
            // imagine a compass turning its needle based on your direction: here, assigned directions depend on reference directions
            switch (refDirection) {
                case "west":
                    if (midPoint.x > refMidPoint.x && midPoint.z === refMidPoint.z) return "west";
                    if (midPoint.x > refMidPoint.x && midPoint.z > refMidPoint.z) return "north";
                    if (midPoint.x > refMidPoint.x && midPoint.z < refMidPoint.z) return "south";
                    break;

                case "east":
                    if (midPoint.x < refMidPoint.x && midPoint.z === refMidPoint.z) return "east";
                    if (midPoint.x < refMidPoint.x && midPoint.z > refMidPoint.z) return "north";
                    if (midPoint.x < refMidPoint.x && midPoint.z < refMidPoint.z) return "south";
                    break;

                case "south":
                    if (midPoint.x === refMidPoint.x && midPoint.z < refMidPoint.z) return "south";
                    if (midPoint.x > refMidPoint.x && midPoint.z < refMidPoint.z) return "west";
                    if (midPoint.x < refMidPoint.x && midPoint.z < refMidPoint.z) return "east";
                    break;

                case "north":
                    if (midPoint.x === refMidPoint.x && midPoint.z > refMidPoint.z) return "north";
                    if (midPoint.x > refMidPoint.x && midPoint.z > refMidPoint.z) return "west";
                    if (midPoint.x < refMidPoint.x && midPoint.z > refMidPoint.z) return "east";
                    break;
            }
        }

        /************************
               Other Ops
        ************************/

        function setCurvePropsForAllRoadSections() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                let roadSectionArr = roadObj.startElementId != globalStartElementComponent.id
                    ? [...roadObj.roadSectionArr].reverse()
                    : roadObj.roadSectionArr;

                for (let i = 0; i < roadSectionArr.length; i++) {
                    const directionOfCurrent = globalRoadSectionPropsMap.get(roadSectionArr[i]).direction;
                    // intermediate sections
                    if (i != 0 && i < roadSectionArr.length - 1) {
                        const directionOfPredecessor = globalRoadSectionPropsMap.get(roadSectionArr[i - 1]).direction;
                        const directionOfSuccessor = globalRoadSectionPropsMap.get(roadSectionArr[i + 1]).direction;
                        const isStartingInCurve = directionOfCurrent != directionOfPredecessor;
                        const isEndingInCurve = directionOfCurrent != directionOfSuccessor;
                        addToMapIfKeyOrValueNotExists(roadSectionArr[i], {
                            isStartingInCurve,
                            isEndingInCurve,
                            directionOfPredecessor,
                            directionOfSuccessor
                        }, globalRoadSectionPropsMap)
                        // initial section
                    } else if (i === 0) {
                        const directionOfSuccessor = globalRoadSectionPropsMap.get(roadSectionArr[i + 1]).direction;
                        const isEndingInCurve = directionOfCurrent != directionOfSuccessor;
                        addToMapIfKeyOrValueNotExists(roadSectionArr[i], {
                            isStartingInCurve: false, // first roadSection can't start in a curve so it is always false
                            isEndingInCurve,
                            directionOfSuccessor,
                        }, globalRoadSectionPropsMap)
                        // final section
                    } else {
                        const directionOfPredecessor = globalRoadSectionPropsMap.get(roadSectionArr[i - 1]).direction;
                        const isStartingInCurve = directionOfCurrent != directionOfPredecessor;
                        addToMapIfKeyOrValueNotExists(roadSectionArr[i], {
                            isStartingInCurve,
                            isEndingInCurve: false, // last roadSection can't end in a curve so it is always false
                            directionOfPredecessor
                        }, globalRoadSectionPropsMap)
                    }
                }
            });
        }

        function setIsFinalElementForAllRoadSections() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                let lastIdx;
                // fixing startElement as reference means that roadObjs' roadSectionArrs that lead towards startElement (isCalled) are reversed
                roadObj.startElementId === globalStartElementComponent.id ?
                    lastIdx = roadObj.roadSectionArr.length - 1
                    : lastIdx = 0
                const finalRoadSectionId = roadObj.roadSectionArr[lastIdx];
                addToMapIfKeyOrValueNotExists(finalRoadSectionId, {
                    isFinalElement: true,
                }, globalRoadSectionPropsMap)
            })
        }

        function getRoadObjsInCallsRelation() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId === globalStartElementComponent.id); // startElement calls other elements
        }

        function getRoadObjsInIsCalledRelation() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id); // startElement is called by other elements
        }

        /************************
                 Helper
        ************************/

        function addToMapIfKeyOrValueNotExists(key, value, map) {
            const existingValue = map.get(key);

            if (!existingValue) {
                map.set(key, value);
            } else if (typeof existingValue === 'object' && typeof value === 'object') {
                Object.entries(value).forEach(([objKey, objValue]) => {
                    if (!existingValue.hasOwnProperty(objKey) || !existingValue[objKey]) {
                        existingValue[objKey] = objValue;
                    }
                });
            }
        }

        return {
            getPropsMapForRelatedRoadsStartElementPOV,
        };
    })();
};