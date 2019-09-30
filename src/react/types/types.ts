import { ReactNode } from 'react';
import { DocumentNode, GraphQLError } from 'graphql';
import Observable from 'zen-observable';

import { FetchResult } from '../../link/core';
import ApolloClient from '../../ApolloClient';
import {
  ApolloQueryResult,
  PureQueryOptions,
  OperationVariables
} from '../../core/types';
import { ApolloError } from '../../errors/ApolloError';
import {
  FetchPolicy,
  WatchQueryFetchPolicy,
  ErrorPolicy,
  FetchMoreQueryOptions,
  MutationUpdaterFn,
} from '../../core/watchQueryOptions';
import { FetchMoreOptions, ObservableQuery } from '../../core/ObservableQuery';
import { NetworkStatus } from '../../core/networkStatus';

/* Common types */

export type Context = Record<string, any>;

export interface ExecutionResult<T = Record<string, any>> {
  data?: T;
  extensions?: Record<string, any>;
  errors?: GraphQLError[];
}

export type CommonOptions<TOptions> = TOptions & {
  client?: ApolloClient<object>;
};

/* Query types */

export interface BaseQueryOptions<TVariables = OperationVariables> {
  ssr?: boolean;
  variables?: TVariables;
  fetchPolicy?: WatchQueryFetchPolicy;
  errorPolicy?: ErrorPolicy;
  pollInterval?: number;
  client?: ApolloClient<any>;
  notifyOnNetworkStatusChange?: boolean;
  context?: Context;
  partialRefetch?: boolean;
  returnPartialData?: boolean;
}

export interface QueryFunctionOptions<
  TData = any,
  TVariables = OperationVariables
> extends BaseQueryOptions<TVariables> {
  displayName?: string;
  skip?: boolean;
  onCompleted?: (data: TData) => void;
  onError?: (error: ApolloError) => void;
}

export type ObservableQueryFields<TData, TVariables> = Pick<
  ObservableQuery<TData, TVariables>,
  | 'startPolling'
  | 'stopPolling'
  | 'subscribeToMore'
  | 'updateQuery'
  | 'refetch'
  | 'variables'
> & {
  fetchMore: (<K extends keyof TVariables>(
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
      FetchMoreOptions<TData, TVariables>
  ) => Promise<ApolloQueryResult<TData>>) &
    (<TData2, TVariables2, K extends keyof TVariables2>(
      fetchMoreOptions: { query?: DocumentNode } & FetchMoreQueryOptions<
        TVariables2,
        K
      > &
        FetchMoreOptions<TData2, TVariables2>
    ) => Promise<ApolloQueryResult<TData2>>);
};

export interface QueryResult<TData = any, TVariables = OperationVariables>
  extends ObservableQueryFields<TData, TVariables> {
  client: ApolloClient<any>;
  data: TData | undefined;
  error?: ApolloError;
  loading: boolean;
  networkStatus: NetworkStatus;
  called: boolean;
}

export interface QueryOptions<TData = any, TVariables = OperationVariables>
  extends QueryFunctionOptions<TData, TVariables> {
  children?: (result: QueryResult<TData, TVariables>) => ReactNode;
  query: DocumentNode;
}

export interface QueryHookOptions<TData = any, TVariables = OperationVariables>
  extends QueryFunctionOptions<TData, TVariables> {
  query?: DocumentNode;
}

export interface LazyQueryHookOptions<
  TData = any,
  TVariables = OperationVariables
> extends Omit<QueryFunctionOptions<TData, TVariables>, 'skip'> {
  query?: DocumentNode;
}

export interface QueryPreviousData<TData, TVariables> {
  client?: ApolloClient<object>;
  query?: DocumentNode;
  observableQueryOptions?: {};
  result?: ApolloQueryResult<TData> | null;
  loading?: boolean;
  options?: QueryOptions<TData, TVariables>;
  error?: ApolloError;
}

export interface QueryCurrentObservable<TData, TVariables> {
  query?: ObservableQuery<TData, TVariables> | null;
  subscription?: ZenObservable.Subscription;
}

export interface QueryLazyOptions<TVariables> {
  variables?: TVariables;
  context?: Context;
}

export type QueryTuple<TData, TVariables> = [
  (options?: QueryLazyOptions<TVariables>) => void,
  QueryResult<TData, TVariables>
];

/* Mutation types */

export type RefetchQueriesFunction = (
  ...args: any[]
) => Array<string | PureQueryOptions>;

export interface BaseMutationOptions<
  TData = any,
  TVariables = OperationVariables
> {
  variables?: TVariables;
  optimisticResponse?: TData | ((vars: TVariables) => TData);
  refetchQueries?: Array<string | PureQueryOptions> | RefetchQueriesFunction;
  awaitRefetchQueries?: boolean;
  errorPolicy?: ErrorPolicy;
  update?: MutationUpdaterFn<TData>;
  client?: ApolloClient<object>;
  notifyOnNetworkStatusChange?: boolean;
  context?: Context;
  onCompleted?: (data: TData) => void;
  onError?: (error: ApolloError) => void;
  fetchPolicy?: WatchQueryFetchPolicy;
  ignoreResults?: boolean;
}

export interface MutationFunctionOptions<
  TData = any,
  TVariables = OperationVariables
> {
  variables?: TVariables;
  optimisticResponse?: TData | ((vars: TVariables | {}) => TData);
  refetchQueries?: Array<string | PureQueryOptions> | RefetchQueriesFunction;
  awaitRefetchQueries?: boolean;
  update?: MutationUpdaterFn<TData>;
  context?: Context;
  fetchPolicy?: WatchQueryFetchPolicy;
}

export interface MutationResult<TData = any> {
  data?: TData;
  error?: ApolloError;
  loading: boolean;
  called: boolean;
  client?: ApolloClient<object>;
}

export declare type MutationFunction<
  TData = any,
  TVariables = OperationVariables
> = (
  options?: MutationFunctionOptions<TData, TVariables>
) => Promise<FetchResult<TData>>;

export interface MutationHookOptions<
  TData = any,
  TVariables = OperationVariables
> extends BaseMutationOptions<TData, TVariables> {
  mutation?: DocumentNode;
}

export interface MutationOptions<TData = any, TVariables = OperationVariables>
  extends BaseMutationOptions<TData, TVariables> {
  mutation: DocumentNode;
}

export type MutationTuple<TData, TVariables> = [
  (
    options?: MutationFunctionOptions<TData, TVariables>
  ) => Promise<ExecutionResult<TData>>,
  MutationResult<TData>
];

/* Subscription types */

export interface OnSubscriptionDataOptions<TData = any> {
  client: ApolloClient<object>;
  subscriptionData: SubscriptionResult<TData>;
}

export interface BaseSubscriptionOptions<
  TData = any,
  TVariables = OperationVariables
> {
  variables?: TVariables;
  fetchPolicy?: FetchPolicy;
  shouldResubscribe?:
    | boolean
    | ((options: BaseSubscriptionOptions<TData, TVariables>) => boolean);
  client?: ApolloClient<object>;
  skip?: boolean;
  onSubscriptionData?: (options: OnSubscriptionDataOptions<TData>) => any;
  onSubscriptionComplete?: () => void;
}

export interface SubscriptionResult<TData = any> {
  loading: boolean;
  data?: TData;
  error?: ApolloError;
}

export interface SubscriptionHookOptions<
  TData = any,
  TVariables = OperationVariables
> extends BaseSubscriptionOptions<TData, TVariables> {
  subscription?: DocumentNode;
}

export interface SubscriptionOptions<
  TData = any,
  TVariables = OperationVariables
> extends BaseSubscriptionOptions<TData, TVariables> {
  subscription: DocumentNode;
  children?: null | ((result: SubscriptionResult<TData>) => JSX.Element | null);
}

export interface SubscriptionCurrentObservable {
  query?: Observable<any>;
  subscription?: ZenObservable.Subscription;
}