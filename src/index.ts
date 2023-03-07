type FetchedResponse = Response;

type ComicResponse = {
  month: number;
  num: number;
  link: string;
  year: number;
  news: string;
  safe_title: string;
  transcript: string;
  alt: string;
  img: string;
  title: string;
  day: number;
};

async function addComic() {
  const innoURL = new URL(
    "https://fwd.innopolis.app/api/hw2?email=a.salloum@innopolis.university"
  );
  const id_result: FetchedResponse = await fetch(innoURL);
  const id: number = await id_result.json();

  const comicURL = new URL("https://getxkcd.vercel.app/api/comic?num=" + id);

  const response_object: FetchedResponse = await fetch(comicURL);
  const comic_data: ComicResponse = await response_object.json();

  const imgElement = document.createElement("img");

  imgElement.src = comic_data.img;
  imgElement.className = "comic";
  imgElement.alt = comic_data.alt;

  const imageContainer = document.getElementById("comic-container");
  imageContainer?.appendChild(imgElement);

  const titleText = document.createTextNode(comic_data.title);

  const titleContainer = document.getElementById("title-container");
  titleContainer?.appendChild(titleText);

  console.log(comic_data.year, comic_data.month, comic_data.day);
  const publishDate = new Date(
    comic_data.year,
    comic_data.month + 1,
    comic_data.day
  );
  const dateText = document.createTextNode(publishDate.toLocaleString());

  const dateContainer = document.getElementById("date-container");
  dateContainer?.appendChild(dateText);
}

addComic();
