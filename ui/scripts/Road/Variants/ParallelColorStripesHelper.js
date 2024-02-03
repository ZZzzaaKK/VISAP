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
                drawSpheresOnMidpoints(roadObj);
                drawTubesBetweenIntersections(roadObj);
                drawSpheresOnRamps(roadObj);
            })
        }

        function drawSpheresOnMidpoints(roadObj) {
            const scene = document.querySelector('a-scene');
            const sphereRadius = 0.2;
            roadObj.roadSectionObjArr.forEach(roadSectionObj => {
                if (roadSectionObj.intersection != null) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: "lime" });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(roadSectionObj.intersection.x, 1, roadSectionObj.intersection.z);
                    scene.object3D.add(sphere);
                }
            })
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

        function drawTubesBetweenIntersections(roadObj) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.05;
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

            const intersections = roadObj.roadSectionObjArr
                .filter(roadSectionObj => roadSectionObj.intersection != null)
                .map(roadSectionObj => roadSectionObj.intersection);

            for (let i = 1; i < intersections.length; i++) {
                const startIntersection = intersections[i - 1];
                const endIntersection = intersections[i];

                const lineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(startIntersection.x, 1, startIntersection.z),
                    new THREE.Vector3(endIntersection.x, 1, endIntersection.z)
                );

                const tubeGeometry = new THREE.TubeGeometry(lineCurve, 64, tubeRadius, 8, false);
                const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
                scene.object3D.add(tubeMesh);
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