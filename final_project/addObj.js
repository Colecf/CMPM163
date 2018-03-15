function addObj( mtlPath, objPath, callback ) {
	var mtlLoader = new THREE.MTLLoader();
	
	mtlLoader.load( mtlPath, function( materials ) {
		materials.preload();

		var objLoader = new THREE.OBJLoader();

		objLoader.setMaterials( materials );

		objLoader.load( objPath, callback );
	} );
}