const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let globalDomHelper;
        let globalRoadSectionPropertiesHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionPropsMap = new Map();
        let globalScene;

        const globalStripeOffsetRoadCenter = 0.25;
        const globalStripeSizePct = 0.3;

        /************************
            Public Functions
        ************************/

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                globalScene = document.querySelector("a-scene");
                globalDomHelper = createDomHelper(controllerConfig);
                globalDomHelper.initialize();
                globalDomHelper.createLegend(
                    [
                        { text: "calls", color: controllerConfig.colorsParallelColorStripes.calls },
                        { text: "isCalled", color: controllerConfig.colorsParallelColorStripes.isCalled },
                    ]);
            }
            globalRoadSectionPropertiesHelper = createRoadSectionPropertiesHelper();
        }

        // entry for all logical actions leading to the offered visualization by this variant in GUI
        function startRoadHighlightActionsForStartElement(startElementComponent, relatedRoadObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedRoadObjsMap;

            globalDomHelper.handleLegendForAction("select");
            globalDomHelper.handleUnrelatedEntityMonochromacyForAction("select", globalRelatedRoadObjsMap);
            handleParallelStripsCreation();
        }

        function resetRoadsHighlight() {
            globalDomHelper.handleLegendForAction("unselect");
            globalDomHelper.handleUnrelatedEntityMonochromacyForAction("unselect", globalRelatedRoadObjsMap)
            const scene = document.querySelector('a-scene');
            scene.object3D.remove(...scene.object3D.children.filter(child => child instanceof THREE.Mesh));

            // Remove tubes
            scene.object3D.remove(...scene.object3D.children.filter(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.TubeGeometry));
        }

        /************************
                Stripes
        ************************/

        function handleParallelStripsCreation() {
            roadObjSectionPropertiesArr = globalRoadSectionPropertiesHelper
                .getRoadObjSectionPropertiesArr(globalStartElementComponent, globalRelatedRoadObjsMap);
            roadObjSectionPropertiesArr.forEach(roadObj => {
                const laneSide = getLaneSideForRoadObj(roadObj);

                if (laneSide === "right") {
                    drawSpheresOnMidpoints(roadObj, laneSide);
                    //drawTubesBetweenIntersections(roadObj, laneSide);
                    //drawSpheresOnRamps(roadObj);
                    //drawTubesToStartEndElement(roadObj)
                }
                
            })
        }

        function drawSpheresOnMidpoints(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const sphereRadius = 0.2;

            const offsetMap = getOffsetMap(roadObj)

            roadObj.roadSectionObjArr.forEach(roadSectionObj => {
                if (roadSectionObj.intersection != null) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: "lime" });
                    const sphere = new THREE.Mesh(geometry, material);
                    const offset = offsetMap.get(roadSectionObj.id)
                    sphere.position.set(roadSectionObj.intersection.x + offset.x, 1, roadSectionObj.intersection.z + offset.z);
                    scene.object3D.add(sphere);
                }
            })
            
        }

        function getOffsetMap(roadObj) {
            const offsetMap = new Map();
            for (let i = 0; i < roadObj.roadSectionObjArr.length; i++) {
                const currentRoadSection = roadObj.roadSectionObjArr[i]
                const direction = currentRoadSection.direction;

                let directionOfPredecessor
                if (i === 0) directionOfPredecessor = null
                else directionOfPredecessor = roadObj.roadSectionObjArr[i-1].direction

                let directionOfSuccessor
                if (i != roadObj.roadSectionObjArr.length -1) directionOfSuccessor = roadObj.roadSectionObjArr[i+1].direction
                else directionOfSuccessor = null;

                switch(direction) {
                    case "north":
                        if (directionOfPredecessor === "west" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (directionOfPredecessor === "east" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "west") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "east") offsetMap.set(currentRoadSection.id, {x: 1, z:1})

                        else if(directionOfPredecessor === "west" && directionOfSuccessor === "west") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "east" && directionOfSuccessor === "west") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "west" && directionOfSuccessor === "east") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "east" && directionOfSuccessor === "east") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else offsetMap.set(currentRoadSection.id, {x: null, z: null})
                    case "south":
                        if (directionOfPredecessor === "west" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (directionOfPredecessor === "east" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "west") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "east") offsetMap.set(currentRoadSection.id, {x: 1, z:1})

                        else if(directionOfPredecessor === "west" && directionOfSuccessor === "west") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "east" && directionOfSuccessor === "west") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "west" && directionOfSuccessor === "east") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "east" && directionOfSuccessor === "east") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else offsetMap.set(currentRoadSection.id, {x: null, z: null})
                    case "west":
                        if (directionOfPredecessor === "north" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (directionOfPredecessor === "south" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "north") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "south") offsetMap.set(currentRoadSection.id, {x: 1, z:1})

                        else if(directionOfPredecessor === "north" && directionOfSuccessor === "north") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "south" && directionOfSuccessor === "north") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "north" && directionOfSuccessor === "south") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "south" && directionOfSuccessor === "south") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else offsetMap.set(currentRoadSection.id, {x: null, z: null})
                    case "east":
                        if (directionOfPredecessor === "north" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (directionOfPredecessor === "south" && !directionOfSuccessor) offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "north") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if (!directionOfPredecessor && directionOfSuccessor === "south") offsetMap.set(currentRoadSection.id, {x: 1, z:1})

                        else if(directionOfPredecessor === "north" && directionOfSuccessor === "north") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "south" && directionOfSuccessor === "north") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "north" && directionOfSuccessor === "south") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else if(directionOfPredecessor === "south" && directionOfSuccessor === "south") offsetMap.set(currentRoadSection.id, {x: 1, z:1})
                        else offsetMap.set(currentRoadSection.id, {x: null, z: null})
                }
            }
            console.log(offsetMap)
            return offsetMap;
        }

        function drawSpheresOnRamps(roadObj) {
            const scene = document.querySelector('a-scene');
            const sphereRadius = 0.2;
            roadObj.roadSectionObjArr.forEach(roadSectionObj => {
                if (roadSectionObj.intersectionWithStartBorder != null) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: "cyan" });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(roadSectionObj.intersectionWithStartBorder.x, 1, roadSectionObj.intersectionWithStartBorder.z);
                    scene.object3D.add(sphere);
                }

                if (roadSectionObj.intersectionWithEndBorder != null) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: "green" });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(roadSectionObj.intersectionWithEndBorder.x, 1, roadSectionObj.intersectionWithEndBorder.z);
                    scene.object3D.add(sphere);
                }
            })
        }

        function drawTubesBetweenIntersections(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.05;
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

            const offsetMap = getOffsetMap(roadObj)

            const intersections = roadObj.roadSectionObjArr
                .filter(roadSectionObj => roadSectionObj.intersection != null)
                .map(roadSectionObj => roadSectionObj.intersection);

            for (let i = 1; i < intersections.length; i++) {
                const startIntersection = intersections[i - 1];
                const endIntersection = intersections[i];

                const offset = offsetMap.get(roadSectionObj.id)

                const lineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(startIntersection.x + offset, 1, startIntersection.z + offset),
                    new THREE.Vector3(endIntersection.x + offsetMap, 1, endIntersection.z + offset)
                );

                const tubeGeometry = new THREE.TubeGeometry(lineCurve, 64, tubeRadius, 8, false);
                const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
                scene.object3D.add(tubeMesh);
            }
        }

        function drawTubesToStartEndElement(roadObj) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.05;
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: "yellow" });
        
            const lastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 1];
            const startElement = roadObj.roadSectionObjArr[0];
        
            if (startElement.intersection && startElement.intersectionWithStartBorder) {
                const startLineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(startElement.intersectionWithStartBorder.x, 1, startElement.intersectionWithStartBorder.z),
                    new THREE.Vector3(startElement.intersection.x, 1, startElement.intersection.z)
                );
        
                const startTubeGeometry = new THREE.TubeGeometry(startLineCurve, 64, tubeRadius, 8, false);
                const startTubeMesh = new THREE.Mesh(startTubeGeometry, tubeMaterial);
                scene.object3D.add(startTubeMesh);
            }
            if (lastElement.intersectionWithEndBorder) {
                predecessorOfLastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 2]
                const endLineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(lastElement.intersectionWithEndBorder.x, 1, lastElement.intersectionWithEndBorder.z),
                    new THREE.Vector3(predecessorOfLastElement.intersection.x, 1, predecessorOfLastElement.intersection.z)
                );
                const endTubeGeometry = new THREE.TubeGeometry(endLineCurve, 64, tubeRadius, 8, false);
                const endTubeMesh = new THREE.Mesh(endTubeGeometry, tubeMaterial);
                scene.object3D.add(endTubeMesh);
            }
        }
        
        
        


        function getLaneSideForRoadObj(roadObj) {
            if (roadObj.startElementId === globalStartElementComponent.id) return "right";
            return "left"
        }

        function getColorForLane(laneSide) {
            if (laneSide === "right") return controllerConfig.colorsParallelColorStripes.calls;
            else return controllerConfig.colorsParallelColorStripes.isCalled;
        }

        return {
            initialize,
            startRoadHighlightActionsForStartElement,
            resetRoadsHighlight,
        };
    })();
};