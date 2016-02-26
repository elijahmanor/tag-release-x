import test from "ava";
import sinon from "sinon";
import { git } from "../helpers/index.js";

const utils = {
	log: {
		begin: sinon.spy(),
		end: sinon.spy()
	},
	prompt: sinon.spy( command => new Promise( resolve => resolve( { shortlog: true } ) ) ),
	editor: sinon.spy( command => new Promise( resolve => resolve( "" ) ) )
};

import { updateShortlog, __RewireAPI__ as RewireAPI } from "../../src/sequence-steps";

test.beforeEach( t => {
	RewireAPI.__Rewire__( "console", { log: sinon.stub() } );
	RewireAPI.__Rewire__( "utils", utils );
} );

test.afterEach( t => {
	RewireAPI.__ResetDependency__( "console" );
	RewireAPI.__ResetDependency__( "utils" );
} );

test.cb( "updateShortlog calls log.begin", t => {
	updateShortlog( [ git, {} ] ).then( () => {
		t.ok( utils.log.begin.called );
		t.end();
	} );
} );

test.cb( "updateShortlog should prompt the user to edit", t => {
	updateShortlog( [ git, {} ] ).then( () => {
		t.ok( utils.prompt.called );
		t.end();
	} );
} );

// test.cb( "updateShortlog calls log.end", t => {
// 	gitShortlog( [ git, {} ] ).then( () => {
// 		t.ok( utils.log.end.called );
// 		t.end();
// 	} );
// } );
