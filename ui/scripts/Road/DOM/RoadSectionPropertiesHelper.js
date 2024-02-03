const createRoadSectionPropertiesHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRoadSectionPropsMap = new Map();

        /************************
            Public Functions
        ************************/

        // returns a props map for individual roadSections where startElement serves as reference for every attribute
        function getPropsMapForRelatedRoadsStartElementPOV(startElementComponent, relatedRoadObjsMap) {
            globalStartElementComponent = startElementComponent;

            createRoadObjIntersectionPropsMap(relatedRoadObjsMap)
            return globalRoadSectionPropsMap;
        }

        function createRoadObjIntersectionPropsMap(relatedRoadObjsMap) {
            let roadObjsAdjustedArr = getRoadObjsWithAdjustedRoadSectionOrder(relatedRoadObjsMap);
            addDirectionOfRoadSectionsRelativeToStartElement(roadObjsAdjustedArr);
            addIntersectionCoordinates(roadObjsAdjustedArr);
            console.log(roadObjsAdjustedArr)
            drawSpheresOnMidpoints(roadObjsAdjustedArr)
            drawTubesBetweenIntersections(roadObjsAdjustedArr)
            //const intersectingRoadSectionsArr = getIntersectingRoadSections(roadObjsAdjustedArr);
        }

        function getRoadObjsWithAdjustedRoadSectionOrder(relatedRoadObjsMap) {
            const roadObjsInCallsRelation = getRoadObjsInCallsRelation(relatedRoadObjsMap);
            const roadObjsInIsCalledRelation = getRoadObjsInIsCalledRelation(relatedRoadObjsMap);
            roadObjsInIsCalledRelation.forEach(roadObj => roadObj.roadSectionObjArr.reverse()); // Reverse the road section arrays in-place
            return [...roadObjsInCallsRelation, ...roadObjsInIsCalledRelation];
        }

        function addIntersectionCoordinates(roadObjsAdjustedArr) {
            roadObjsAdjustedArr.forEach(roadObj => {
                for (let i = 1; i < roadObj.roadSectionObjArr.length; i++) {
                    const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                    const refRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
                    // a curve
                    if (currentRoadSectionObj.direction != refRoadSectionObj.direction) {
                        currentRoadSectionObj.intersection, refRoadSectionObj.intersection
                            = getIntersectionCoordinates(currentRoadSectionObj, refRoadSectionObj)
                    } else refRoadSectionObj.intersection = null;
                }
            })
        }


        function addDirectionOfRoadSectionsRelativeToStartElement(roadObjsAdjustedArr) {
            roadObjsAdjustedArr.forEach(roadObj => {
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


        function drawSpheresOnMidpoints(roadObjsAdjustedArr) {
            const scene = document.querySelector('a-scene');
            const sphereRadius = 0.2;
            roadObjsAdjustedArr.forEach(roadObj => {
                roadObj.roadSectionObjArr.forEach(roadSectionObj => {
                    if (roadSectionObj.intersection != null) {
                        const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const sphere = new THREE.Mesh(geometry, material);
                        sphere.position.set(roadSectionObj.intersection.x, 1, roadSectionObj.intersection.z);
                        scene.object3D.add(sphere);
                    }
                })
            })
        }

        function drawTubesBetweenIntersections(roadObjsAdjustedArr) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.05; 
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        
            roadObjsAdjustedArr.forEach(roadObj => {
                for (let i = 1; i < roadObj.roadSectionObjArr.length; i++) {
                    const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                    const prevRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
        
                    if (currentRoadSectionObj.intersection != null && prevRoadSectionObj.intersection != null) {
                        const lineCurve = new THREE.LineCurve3(
                            new THREE.Vector3(currentRoadSectionObj.intersection.x, 1, currentRoadSectionObj.intersection.z),
                            new THREE.Vector3(prevRoadSectionObj.intersection.x, 1, prevRoadSectionObj.intersection.z)
                        );
        
                        const tubeGeometry = new THREE.TubeGeometry(lineCurve, 64, tubeRadius, 8, false);
                        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
                        scene.object3D.add(tubeMesh);
                    }
                }
            });
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
            getPropsMapForRelatedRoadsStartElementPOV,
        };
    })();
};