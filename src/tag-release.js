/* eslint no-console: 0 */

import simpleGitFactory from "simple-git";
import utils from "./utils";
import VersionManager from "version-manage";
import sequence from "when/sequence";
import sequenceSteps from "./sequence-steps";
import { merge } from "lodash";

function updateVersion( release ) {
	const packageJson = utils.readJSONFile( "./package.json" );
	const versionManager = new VersionManager( packageJson.version );
	const oldVersion = versionManager.version;

	versionManager.increment( release );
	const newVersion = packageJson.version = versionManager.version;
	utils.writeJSONFile( "./package.json", packageJson );

	return { oldVersion, newVersion };
}

export default options => {
	const git = simpleGitFactory( "." );

	console.log( `Tagging a ${ options.release } release ${ options.develop ? "with" : "without" } a develop branch` );

	options = merge( {}, options, { versions: updateVersion( options.release ) } );
	const { versions } = options;
	console.log( `Updated package.json from ${ versions.oldVersion } to ${ versions.newVersion }` );

	sequence( sequenceSteps, [ git, options ] )
		.then( () => {
			console.log( "Finished" );
			console.log( "Remember to add the version to the cards (as a tag) in LeanKit that were git tagged." );
		} );
};
