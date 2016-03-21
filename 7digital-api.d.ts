export namespace Responses {
    interface ApiResponse {
        status: string;
        version: string;
    }
    namespace Release {
        interface ReleaseResponse extends ApiResponse {
            release: Release
        }
        interface ReleasePrice {
            currencyCode: string;
            sevendigitalPrice: string;
            recommendedRetailPrice: string;
        }
        interface Artist {
            id: string;
            name: string;
            appearsAs: string;
            slug: string;
            image: string;
            isPlaceholderImage: string;
        }
        interface Release {
            id: string;
            title: string;
            barcode: string;
            year: string;
            explicitContent: string;
            slug: string;
            artist: Artist;
            image: string;
            label: Label;
            licensor: Licensor;
            popularity: string;
            duration: string;
            trackCount: string;
            download: Download;
        }
        interface Format {
            id: string;
            description: string;
        }
        interface Formats {
            format: Array<Format>;
        }
        interface Package {
            id: string;
            description: string;
            price: ReleasePrice;
            formats: Formats;
        }
        interface Packages {
            package: Array<Package>;
        }
        interface Download {
            releaseDate: string;
            packages: Packages;
        }
        interface Label {
            id: string;
            name: string;
        }
        interface Licensor {
            id: string;
            name: string;
        }
    }
    namespace Basket {
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
            err:Error, basket:Responses.Basket.BasketResponse
        ) => void
    ) => void;
    create: (any, callback: (
        err:Error, basket:Responses.Basket.BasketResponse
        ) => void
    ) => void;
    addItem: (AddItemParams, callback: (
        err:Error, basket:Responses.Basket.BasketResponse
        ) => void
    ) => void;
    removeItem: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    applyVoucher: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    addPricedItem: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getPayPalUrl: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    completePayPalPurchase: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}
export class Releases {
    getByDate: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getDetails: (
        params: any,
        callback: (
            err:Error,
            response:Responses.Release.ReleaseResponse
        ) => void
    ) => void;
    getEditorial: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getChart: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getRecommendations: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    search: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getTracks: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getTags: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    matchById: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getNewByTags: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getTopByTags: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Artists {
    browse: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getChart: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getDetails: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getReleases: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getSimilar: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    search: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getTopTracks: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getTags: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    matchById: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getTopByTags: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Tracks {
    getChart: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getDetails: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    search: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    matchById: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Tags {
    all: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}


export class User {
    getLocker: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    purchaseItem: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    purchaseRrpItem: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    purchaseBasket: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    purchasePricedItem: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    listCards: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    selectCard: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    deleteCard: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    registerCard: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getCardRegistration: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    deliverItem: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    signup: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    create: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getDetails: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    authenticate: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Users {
    find: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    update: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Territories {
    getCountries: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Translations {
    get: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class IpLookup {
    getCountryForIp: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Editorial {
    getList: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Catalogue {
    getArtistIdByUrl: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getReleaseIdByUrl: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}

export class Payment {
    getCardTypes: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
    getVoucherDetails: (
        params: any,
        callback: (
            err:Error,
            response:any
        ) => void
    ) => void;
}
