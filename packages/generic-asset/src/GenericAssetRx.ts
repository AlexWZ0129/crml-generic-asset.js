// Copyright 2019 Centrality Investments Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {ApiRx} from '@cennznet/api';
import {SubmittableResult} from '@cennznet/api/polkadot';
import {QueryableStorageFunction, SubmittableExtrinsic} from '@cennznet/api/polkadot.types';
import {AnyNumber, Codec} from '@cennznet/types/polkadot.types';
import {assert} from '@cennznet/util';
import BN from 'bn.js';
import {from, Observable, of} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import * as derives from './derives';
import EnhancedAssetId from './registry/EnhancedAssetId';
import {
    AnyAddress,
    AnyAssetId,
    CodecArgObject,
    IAssetOptions,
    QueryableGetBalance,
    QueryableGetBalanceRx,
} from './types';

export class GenericAssetRx {
    static create(api: ApiRx): Observable<GenericAssetRx> {
        if (api.genericAsset) {
            return of(api.genericAsset);
        }
        (api as any)._options.derives = {...(api as any)._options.derives, genericAsset: derives};
        return from((api as any).loadMeta()).pipe(mapTo(new GenericAssetRx(api)));
    }

    private _api: ApiRx;

    constructor(api: ApiRx) {
        assert(
            (api as any)._options.derives.genericAsset || ((api as any)._derive || {}).genericAsset,
            "init generic asset's derives first"
        );
        this._api = api;
        api.registerTypes({
            AssetId: EnhancedAssetId,
        });
    }

    get api(): ApiRx {
        return this._api;
    }

    /**
     * Create an asset
     * @param options Initialization options of an asset
     */
    create(options: IAssetOptions): SubmittableExtrinsic<Observable<SubmittableResult>, Observable<{}>> {
        return this.api.tx.genericAsset.create((options as unknown) as CodecArgObject);
    }

    /**
     * Transfer asset to the destination account
     * @param assetId The id or symbol (for reserved asset) of the transferred asset
     * @param dest The address of the destination account
     * @param amount The amount to be transferred
     */
    transfer(
        assetId: AnyAssetId,
        dest: AnyAddress,
        amount: AnyNumber
    ): SubmittableExtrinsic<Observable<SubmittableResult>, Observable<Codec>> {
        return this.api.tx.genericAsset.transfer(new EnhancedAssetId(assetId), dest, amount);
    }

    /**
     * Mint asset to the destination account
     * @param assetId The ID or symbol (for reserved asset) of the asset to be minted
     * @param destination The address of the destination account
     * @param amount The amount to be minted
     */
    mint(
        assetId: AnyAssetId,
        destination: AnyAddress,
        amount: AnyNumber
    ): SubmittableExtrinsic<Observable<SubmittableResult>, Observable<Codec>> {
        return this.api.tx.genericAsset.mint(new EnhancedAssetId(assetId), destination, amount);
    }

    /**
     * Burn asset from the source account
     * @param assetId The ID or symbol (for reserved asset) of the asset to be minted
     * @param source The address of the source account
     * @param amount The amount to be burned
     */
    burn(
        assetId: AnyAssetId,
        source: AnyAddress,
        amount: AnyNumber
    ): SubmittableExtrinsic<Observable<SubmittableResult>, Observable<Codec>> {
        return this.api.tx.genericAsset.burn(new EnhancedAssetId(assetId), source, amount);
    }

    /**
     * Query the next available asset ID
     */
    get getNextAssetId(): QueryableStorageFunction<Observable<EnhancedAssetId>, {}> {
        return this.api.query.genericAsset.nextAssetId as any;
    }

    /**
     * Query the total issuance of an asset
     * @return a QueryableStorageFunction that needs a argument assetId
     * @param assetId id or symbol (for reserved asset) of the asset
     */
    get getTotalIssuance(): QueryableStorageFunction<Observable<BN>, {}> {
        return this.api.query.genericAsset.totalIssuance as any;
    }

    // tslint:disable:member-ordering
    /**
     * Query free balance of an asset for an account
     * @param assetId The id or symbol (for reserved asset) of the asset
     * @param address The address of the account
     */
    get getFreeBalance(): QueryableGetBalanceRx {
        const _fn = this.api.derive.genericAsset.freeBalance as any;
        _fn.at = this.api.derive.genericAsset.freeBalanceAt as any;

        return _fn;
    }

    /**
     * Query reserved balance of an asset for an account
     * @param assetId The id or symbol (for reserved asset) of the asset
     * @param address The address of the account
     */
    get getReservedBalance(): QueryableGetBalanceRx {
        const _fn = this.api.derive.genericAsset.reservedBalance as any;
        _fn.at = this.api.derive.genericAsset.reservedBalanceAt as any;

        return _fn;
    }

    /**
     * Query total balance of an asset for an account
     * @param assetId The id or symbol (for reserved asset) of the asset
     * @param address The address of the account
     */
    get getTotalBalance(): QueryableGetBalance {
        const _fn = this.api.derive.genericAsset.totalBalance as any;
        _fn.at = this.api.derive.genericAsset.totalBalanceAt as any;

        return _fn;
    }
    // tslint:enable:member-ordering
}
