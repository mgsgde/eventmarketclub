export const EVENT_TYPES = {
  WORKSHOP: 'WORKSHOP',
  MEETUP: 'MEETUP',
}

export const SAMPLE_EVENTS = [
  {
    guests: [],
    host_user_id: 'auth0|9723z813',
    kind: 'Workshop',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 5-8 pm`,
    description: 'Culpa reprehenderit sed dolore ut dolor ut nisi ut magna commodo cillum id in est aute veniam quis exercitation commodo labore eu cupidatat voluptate adipisicing incididunt dolore.',
    organizer: 'Lester',
    rating: {
      stars: 5,
      number_of_likes: 4,
    },
    price: 3,
    availability: '2/4',
  },
  {
    guests: [],
    host_user_id: 'auth0|9723z813',
    kind: 'Workshop',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 3-5 pm`,
    description: 'Amet elit anim occaecat eiusmod sint eiusmod voluptate ea non magna quis fugiat occaecat non commodo amet id dolore in elit voluptate pariatur ut anim ea in magna laboris esse laborum amet laborum dolore excepteur sunt.',
    rating: {
      stars: 4,
      number_of_likes: 95,
    },
    price: 5,
    availability: '2/8',
  },
  {
    guests: [],
    host_user_id: 'auth0|9723z813',
    kind: 'Workshop',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 8-9 pm`,
    description: 'Amet ullamco id amet reprehenderit laborum non ullamco do id quis pariatur est non deserunt voluptate laboris ut sit.',
    rating: {
      stars: 2,
      number_of_likes: 24,
    },
    price: 15,
    availability: '12/40',
  },
  {
    guests: [],
    host_user_id: 'auth0|9723z813',
    kind: 'Meetup',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 8-11 pm`,
    description: 'Tempor elit nulla veniam commodo eiusmod in amet irure ad ex qui elit do dolor est dolore nulla pariatur in mollit pariatur dolor dolore pariatur velit deserunt duis id minim in enim est mollit consectetur fugiat.',
    organizer: 'Trevor',
    rating: {
      stars: 4,
      number_of_likes: 1329,
    },
    price: 200,
    availability: '0/1',
  },
]

export const SAMPLE_ORGANIZED_EVENTS = [
  {
    guests: [],
    host_user_id: 'auth0|6060492dedabe000709929ab',
    kind: 'Meetup',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 8-11 pm`,
    description: 'Est officia ea consectetur dolor ullamco consectetur ut in eiusmod id ea sunt non proident cupidatat ex laboris officia.',
    organizer: 'Trevor',
    rating: {
      stars: 4,
      number_of_likes: 1329,
    },
    price: 200,
    availability: '0/1',
  },
  {
    guests: [],
    host_user_id: 'auth0|6060492dedabe000709929ab',
    kind: 'Meetup',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 8-11 pm`,
    description: 'Lorem ipsum irure commodo consequat aliquip cupidatat velit irure enim dolor esse deserunt cillum ut fugiat consectetur ut eu elit et laborum.',
    organizer: 'Trevor',
    rating: {
      stars: 4,
      number_of_likes: 1329,
    },
    price: 200,
    availability: '0/1',
  },
]

export const SAMPLE_JOINED_EVENTS = [
  {
    guests: ['auth0|6060492dedabe000709929ab'],
    host_user_id: 'auth0|605a38703ee6c900757f24b2',
    kind: 'Meetup',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 8-11 pm`,
    description: 'Labore ut labore in minim in sit adipisicing officia amet incididunt in non dolor eu ex dolore et ad do velit deserunt velit ut nostrud dolore sunt proident excepteur in ut consequat proident tempor labore ut dolor.',
    organizer: 'Trevor',
    rating: {
      stars: 4,
      number_of_likes: 1329,
    },
    price: 200,
    availability: '0/1',
  },
  {
    guests: ['auth0|6060492dedabe000709929ab'],
    host_user_id: 'auth0|605a38703ee6c900757f24b2',
    kind: 'Meetup',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 8-11 pm`,
    description: 'Magna laboris ex officia quis culpa aliquip aute eiusmod sint laborum duis reprehenderit quis do in sit sed reprehenderit mollit.',
    organizer: 'Trevor',
    rating: {
      stars: 4,
      number_of_likes: 1329,
    },
    price: 200,
    availability: '0/1',
  },
  {
    guests: ['auth0|6060492dedabe000709929ab'],
    host_user_id: 'auth0|605a38703ee6c900757f24b2',
    kind: 'Meetup',
    city: 'Karlsruhe', event_id: 12345,
    datetime: `${new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toDateString()}, 8-11 pm`,
    description: 'Do labore culpa dolore quis deserunt dolore mollit excepteur cillum exercitation fugiat nulla velit ut incididunt ullamco consequat ex eu tempor pariatur incididunt voluptate duis.',
    organizer: 'Trevor',
    rating: {
      stars: 4,
      number_of_likes: 1329,
    },
    price: 200,
    availability: '0/1',
  },
]
