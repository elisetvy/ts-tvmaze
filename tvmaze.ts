import axios from "axios";
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

interface ShowDataInterface {
  score: number;
  show: object;
}


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShowsByTerm(term: string | undefined): Promise<ShowObjectInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await fetch(`${TV_MAZE_BASE_URL}/search/shows?q=${term}`);

  const shows = await response.json();

  return shows.map(showData => {
    const show = showData.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image?.original || DEFAULT_IMAGE
    };
  });

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowObjectInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
              alt="Bletchly Circle San Francisco"
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
  const shows = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }