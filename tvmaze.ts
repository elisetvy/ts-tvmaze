import jQuery from 'jquery';

const TV_MAZE_BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMAGE = "https://tinyurl.com/tv-missing";

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


interface ShowObjectInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

// interface ShowDataInterface {
//   score: number;
//   show: {
//     id: number;
//     url: string;
//     name: string;
//     type: string;
//     language: string;
//     genres: string[];
//     status: string;
//     runtime: number;
//     averageRuntime: number;
//     premiered: string;
//     ended: string;
//     officialSite: string;
//     schedule: {
//       time: string;
//       days: string[];
//     };
//     rating: {
//       average: number;
//     };
//     weight: number;
//     network: {
//       id: number;
//       name: string;
//       country: {
//         name: string;
//         code: string;
//         timezone: string;
//       };
//       officialSite: string;
//     };
//     webChannel: null;
//     dvdCountry: null;
//     externals: {
//       tvrage: number;
//       thetvdb: number;
//       imdb: string;
//     };
//     image: {
//       medium: string;
//       original: string;
//     };
//     summary: string;
//     updated: number;
//     _links: {
//       self: {
//         href: string;
//       };
//       previousepisode: {
//         href: string;
//       };
//     };
//   };
// }

interface EpisodeDataInterface {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number;
  rating: {
    average: null;
  };
  image: null;
  summary: string;
  _links: {
    self: {
      href: string;
    };
    show: {
      href: string;
    };
  };
}

interface EpisodeObjectInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

interface ShowDataInterface {
  show: {
    id: number,
    name: string,
    summary: string,
    image: { medium: string; } | null,
  };
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShowsByTerm(term: string): Promise<ShowObjectInterface[]> {
  const response = await fetch(`${TV_MAZE_BASE_URL}/search/shows?q=${term}`);

  const data = await response.json() as ShowDataInterface[];

  const showsArr = data.map(show => {

    const showObject: ShowObjectInterface = {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image?.medium || DEFAULT_IMAGE
    };
    return showObject;
  });

  return showsArr;
}


/** Given list of shows, create markup for each and to DOM */
//TODO: don't need to return void here
function populateShows(shows: ShowObjectInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="show image"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();

  let shows: ShowObjectInterface[];

  if (typeof term === "string") {
    shows = await searchShowsByTerm(term);
    populateShows(shows);
  }

  $episodesArea.hide();
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: string) {
  const response = await fetch(`${TV_MAZE_BASE_URL}/shows/${id}/episodes`);
  const data = await response.json() as EpisodeObjectInterface[];

  const episodeArr = data.map(episode => {
    const episodeObject: EpisodeObjectInterface = {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    };
    return episodeObject;
  });

  return episodeArr;
}

/** Given list of episodes, create li for each episode, append to ul */
//TODO: Don't need to return void
function populateEpisodes(episodes: EpisodeObjectInterface[]): void {

  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode =
      `<li>
    ${episode.name}
    (season: ${episode.season}, episode number: ${episode.number})
    <li>`;
    $episodesArea.append($episode);
  }

  $episodesArea.show();
}

/**
 * Recieves target from click event, gets show id from parent element,
 * requests episodes based on id, calls populateEpisodes to append to the dom
 *
 */
async function getEpisodesAndDisplay(target: EventTarget) {
  const showId = $(target).closest('.Show').attr('data-show-id') as string;
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

/** On click of episodes button, gets event target to identify episode */
$showsList.on("click", ".Show-getEpisodes",
  async function handleClick(evt: JQuery.ClickEvent): Promise<void> {
    evt.preventDefault();
    await getEpisodesAndDisplay(evt.target);
  }
);