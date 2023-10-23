import { HttpClient, HttpParams } from "@angular/common/http";
import { PaginationResult } from "../_models/pagination";
import { map } from "rxjs";

export function getPaginatedResult<T>(url: string, params: HttpParams, http: HttpClient) {
    const paginationResult: PaginationResult<T> = new PaginationResult<T>;

    return http.get<T>(url, { observe: 'response', params }).pipe(
      map(responce => {
        if (responce.body) {
          paginationResult.result = responce.body;
        }
        const pagination = responce.headers.get('Pagination');
        if (pagination) {
          paginationResult.pagination = JSON.parse(pagination);
        }
        return paginationResult;
      })
    );
  }

export function getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
  
    return params;
  }