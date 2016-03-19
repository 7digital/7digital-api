export namespace Responses {
	interface ApiResponse {
		status: string;
		version: string;
	}
	interface BasketResponse extends ApiResponse {
		basket: Basket;
	}
	interface AmountDue {
		amount: string;
		formattedAmount: string;
	}
	interface Package {
		id: string;
	}
	interface BasketItem {
		id: string;
		type: string;
		itemName: string;
		artistName: string;
		releaseId: string;
		trackId:string;
		price: Price;
		amountDue: AmountDue;
		package: Package;
	}
	interface Basket {
		id: string;
		basketItems: Array<BasketItem>;
		itemCount: string;
		amountDue: AmountDue;
	}
	interface Currency {
		_: string;
		code: string;
	}
	interface Price {
		value: string;
		fomattedPrice: string;
		currency: Currency;
	}
}

interface BasketParams {
	basketId: string;
	country: string;
}

interface AddItemParams extends BasketParams {
	releaseId: string;
	trackId: string;
	packageId: string;
	affiliatePartner: string;
}

export class Basket {
	get: (
		params:BasketParams,
		callback: (
			err:Error, basket:Responses.BasketResponse
		) => void
	) => void;
	create: (any, callback: (
		err:Error, basket:Responses.BasketResponse
		) => void
	) => void;
	addItem: (AddItemParams, callback: (
		err:Error, basket:Responses.BasketResponse
		) => void
	) => void;
}
