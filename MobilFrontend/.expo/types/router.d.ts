/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } |
      { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } |
      { pathname: `/create-event`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } |
      { pathname: `/router.d`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/events` | `/events`; params?: Router.UnknownInputParams; } | {
        pathname: `${'/(tabs)'}/Home` |
        `/Home`; params?: Router.UnknownInputParams;
      } | { pathname: `${'/(tabs)'}/mytickets` | `/mytickets`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } |
      { pathname: `/event/[id]`, params: Router.UnknownInputParams & { id: string | number; } } |
      { pathname: `/manage-event/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } |
      { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } |
      { pathname: `/create-event`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } |
      { pathname: `/router.d`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } |
      { pathname: `${'/(tabs)'}/events` | `/events`; params?: Router.UnknownOutputParams; } |
      { pathname: `${'/(tabs)'}/Home` | `/Home`; params?: Router.UnknownOutputParams; } |
      { pathname: `${'/(tabs)'}/mytickets` | `/mytickets`; params?: Router.UnknownOutputParams; } |
      { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownOutputParams; } |
      { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownOutputParams; } |
      { pathname: `/event/[id]`, params: Router.UnknownOutputParams & { id: string; } } |
      { pathname: `/manage-event/[id]`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/create-event${`?${string}` | `#${string}` | ''}` |
      `/login${`?${string}` | `#${string}` | ''}` | `/router.d${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` |
      `#${string}` | ''}` | `${'/(tabs)'}/events${`?${string}` | `#${string}` | ''}` | `/events${`?${string}` | `#${string}` |
      ''}` | `${'/(tabs)'}/Home${`?${string}` | `#${string}` | ''}` | `/Home${`?${string}` | `#${string}` | ''}` |
      `${'/(tabs)'}/mytickets${`?${string}` | `#${string}` | ''}` | `/mytickets${`?${string}` | `#${string}` | ''}` |
      `${'/(tabs)'}/profile${`?${string}` | `#${string}` | ''}` | `/profile${`?${string}` | `#${string}` | ''}` |
      `${'/(tabs)'}/search${`?${string}` | `#${string}` | ''}` | `/search${`?${string}` | `#${string}` | ''}` |
      { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } |
      { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } |
      { pathname: `/create-event`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } |
      { pathname: `/router.d`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/events` | `/events`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/Home` | `/Home`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/mytickets` | `/mytickets`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } |
      { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } |
      `/event/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` |
      `/manage-event/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` |
      { pathname: `/event/[id]`, params: Router.UnknownInputParams & { id: string | number; } } |
      { pathname: `/manage-event/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}
