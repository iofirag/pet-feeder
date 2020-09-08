export default class HttpService {

  public static executeRequest = async (url: RequestInfo, op?: RequestInit ) => {
    if (!op) {
      op = {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        // mode: 'cors', // no-cors, *cors, same-origin
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: new Headers()
        // {
          // 'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        //}
        ,
        // redirect: 'follow', // manual, *follow, error
        // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        // body: JSON.stringify(data) // body data type must match "Content-Type" header
      }
    }

    // if (!op.headers) op.headers = {}
    // op.headers['cache-control'] = 'no-cache';
    op.cache ="no-store"
    return await fetch(url, op)
  }
}