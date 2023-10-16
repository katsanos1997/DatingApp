import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { map, of, take } from 'rxjs';
import { PaginationResult } from '../_models/pagination';
import { UserParams } from '../_models/userParaps';
import { AccountService } from './account.service';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User | undefined;
  userParams: UserParams | undefined;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user){
          this.userParams = new UserParams(user);
          this.user = user;
        }
      }

    })
  }

  getUserParams(){
    return this.userParams;
  }

  setUserParams(params: UserParams){
    this.userParams = params;
  }

  resetUserParams(){
    if (this.user){
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMembers(userParams: UserParams ){
    const responce = this.memberCache.get(Object.values(userParams).join('-'));
    
    if(responce) return of(responce)

    let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params).pipe(
      map(responce => {
        this.memberCache.set(Object.values(userParams).join('-'), responce);
        return responce;
      })
    )
  }

  getMember(username: string){
    //const member = this.members.find(x => x.userName === username);
    //if (member) return of(member);
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username);
    
    if(member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }


  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = {...this.members[index], ...member}
      })
    )
  }

  setMainPhoto(photoId: number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username: string){
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number){
    let params = this.getPaginationHeaders(pageNumber, pageSize);

    params = params.append('predicate', predicate);

    return this.getPaginatedResult<Member[]>(this.baseUrl + 'likes', params);
    //return this.http.get<Member[]>(this.baseUrl + 'likes?predicate=' + predicate);
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginationResult: PaginationResult<T> = new PaginationResult<T>;

    return this.http.get<T>(url, { observe: 'response', params }).pipe(
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

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
  
    return params;
  }
}
