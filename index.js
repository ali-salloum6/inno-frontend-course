async function addComic() {
  const res1 = await fetch(
    "https://fwd.innopolis.app/api/hw2?email=a.salloum@innopolis.university"
  );
  const data = await res1.json();
  console.log(data);

  const res2 = await fetch("https://getxkcd.vercel.app/api/comic?num=" + data);
  const data2 = await res2.json();
  console.log(data2);

  const imgElement = document.createElement("img");

  imgElement.src = data2.img;
  imgElement.className = "comic";
  imgElement.alt = data2.alt;

  const imageContainer = document.getElementsByClassName("comic-container")[0];
  imageContainer.appendChild(imgElement);

  const titleText = document.createTextNode(data2.title);


  const titleContainer = document.getElementsByClassName("title-container")[0];
  titleContainer.appendChild(titleText);

  const publishDate = new Date(Date.UTC(data2.year, data2.month, data2.day));

  const dateText = document.createTextNode(publishDate);

  const dateContainer = document.getElementsByClassName("date-container")[0];
  dateContainer.appendChild(dateText);
}

addComic();
