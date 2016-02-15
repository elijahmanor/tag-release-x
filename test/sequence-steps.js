/* eslint no-console: 0 */

import test from "ava";
import "babel-core/register";
import { isObject } from "lodash";
import sinon from "sinon";
import proxyquire from "proxyquire";
// import { gitFetchUpstreamMaster } from "../src/sequence-steps";
const { gitFetchUpstreamMaster, gitCheckoutMaster } = proxyquire( "../src/sequence-steps", {
	"./utils": {
		log: {
			begin: sinon.spy()
		}
	}
} );

const git = {
	fetch( arg1, arg2, callback ) {
		callback( null, "success" );
	},
	checkout( arg1, callback ) {
		callback( null, "success" );
	}
};
const options = {};
const isPromise = promise => {
	return isObject( promise ) &&
		promise.then instanceof Function &&
		promise.catch instanceof Function;
};

test( "gitFetchUpstreamMaster returns a promise", t => {
	const promise = gitFetchUpstreamMaster( [ git, options ] );
	t.ok( isPromise( promise ) );
} );

test( "gitCheckoutMaster returns a promise", t => {
	const promise = gitCheckoutMaster( [ git, options ] );
	t.ok( isPromise( promise ) );
} );
