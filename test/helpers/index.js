import { isObject } from "lodash";
import sinon from "sinon";

export const git = {
	checkout: sinon.spy( ( arg, callback ) => callback( null, "success" ) ),
	merge: sinon.spy( ( arg, callback ) => callback( null, "success" ) )
};

export function isPromise( promise ) {
	return isObject( promise ) &&
		promise.then instanceof Function &&
		promise.catch instanceof Function;
}
