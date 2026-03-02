import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {Key} from "../models/key/key";

@Injectable({
  providedIn: 'root'
})
export class KeyService {
  private API_URL = environment.API_URL;

  constructor(
    private http: HttpClient,
  ) {
  }

  public getKey(id: string): Observable<Key> {
    const url = `${this.API_URL}/get/${id}`;
    const req = {}
    return this.http.post<Key>(url, req).pipe(
      map((resp: Key) => {
        return new Key(resp);
      }),
    );
  }
}
