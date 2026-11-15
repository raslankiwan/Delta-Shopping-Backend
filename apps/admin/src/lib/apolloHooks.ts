import {
  useMutation,
  useQuery,
  type ApolloError,
  type MutationHookOptions,
  type MutationTuple,
  type OperationVariables,
  type QueryHookOptions,
  type QueryResult,
  type TypedDocumentNode,
} from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authStore";
import { isSessionError } from "./errors";

/**
 * Thin wrappers around Apollo's useQuery/useMutation that centralize the
 * "unauthenticated GraphQL error -> clear session + redirect to /login"
 * behavior that used to live in main.tsx's react-query QueryCache/MutationCache
 * onError handlers.
 */

export function useAdminQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
): QueryResult<TData, TVariables> {
  const navigate = useNavigate();
  return useQuery(document, {
    ...options,
    onError: (error: ApolloError) => {
      if (isSessionError(error)) {
        logout();
        navigate("/login", { replace: true });
      }
      options?.onError?.(error);
    },
  });
}

export function useAdminMutation<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables>,
): MutationTuple<TData, TVariables> {
  const navigate = useNavigate();
  return useMutation(document, {
    ...options,
    onError: (error, clientOptions) => {
      if (isSessionError(error)) {
        logout();
        navigate("/login", { replace: true });
      }
      options?.onError?.(error, clientOptions);
    },
  });
}
