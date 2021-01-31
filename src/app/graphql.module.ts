import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import {environment} from '../environments/environment';
import {WebSocketLink} from '@apollo/client/link/ws';

const uri = (environment.address + '/api').replace('http://', 'ws://');
console.log('uri:', uri);

export function createApollo(): ApolloClientOptions<any> {
  return {
    cache: new InMemoryCache(),
    link: new WebSocketLink({
      uri,
      options: {
        reconnect: true,
        connectionParams: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      }
    }),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {
}
