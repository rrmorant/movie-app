import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import MovieList from "./components/MovieList";
import MovieListHeading from "./components/MovieListHeading";
import SearchBox from "./components/SearchBox";
import AddFavorites from "./components/AddFavorites";
import RemoveFavorites from "./components/RemoveFavorites";

const App = () => {
	const [movies, setMovies] = useState([]);
	const [favorites, setFavorites] = useState([]);
	const [searchValue, setSearchValue] = useState("");

	const getMovieRequest = async (searchValue) => {
		const apiKey = process.env.REACT_APP_OMDB_API_KEY;
		const url = `http://www.omdbapi.com/?s=${searchValue}&apikey=${apiKey}`;

		const response = await fetch(url);
		const responseJson = await response.json();

		if (responseJson.Search) {
			setMovies(responseJson.Search);
		}
	};

	useEffect(() => {
		getMovieRequest(searchValue);
	}, [searchValue]);

	useEffect(() => {
		const movieFavorites = JSON.parse(
			localStorage.getItem("react-movie-app-favorites")
		);

		if (movieFavorites) {
			setFavorites(movieFavorites);
		}
	}, []);

	const saveToLocalStorage = (items) => {
		localStorage.setItem("react-movie-app-favorites", JSON.stringify(items));
	};

	const addFavoriteMovie = (movie) => {
		const newFavoriteList = [...favorites, movie];
		setFavorites(newFavoriteList);
		saveToLocalStorage(newFavoriteList);
	};

	const removeFavoriteMovie = (movie) => {
		const newFavoriteList = favorites.filter(
			(favorite) => favorite.imdbID !== movie.imdbID
		);

		setFavorites(newFavoriteList);
		saveToLocalStorage(newFavoriteList);
	};

	const movieRowRef = useRef(null);
	const favoritesRowRef = useRef(null);

	const addMouseScroll = (rowRef) => {
		const row = rowRef.current;

		let isDown = false;
		let startX;
		let scrollLeft;

		const mouseDownHandler = (e) => {
			isDown = true;
			row.classList.add("active");
			startX = e.pageX - row.offsetLeft;
			scrollLeft = row.scrollLeft;
		};
		const mouseLeaveHandler = () => {
			isDown = false;
			row.classList.remove("active");
		};

		const mouseUpHandler = () => {
			isDown = false;
			row.classList.remove("active");
		};

		const mouseMoveHandler = (e) => {
			if (!isDown) return;
			e.preventDefault();
			const x = e.pageX - row.offsetLeft;
			const walk = (x - startX) * 2;
			row.scrollLeft = scrollLeft - walk;
		};

		const wheelHandler = (e) => {
			e.preventDefault();
			row.scrollLeft += e.deltaY;
		};

		row.addEventListener("mousedown", mouseDownHandler);
		row.addEventListener("mouseleave", mouseLeaveHandler);
		row.addEventListener("mouseup", mouseUpHandler);
		row.addEventListener("mousemove", mouseMoveHandler);
		row.addEventListener("wheel", wheelHandler);

		return () => {
			row.removeEventListener("mousedown", mouseDownHandler);
			row.removeEventListener("mouseleave", mouseLeaveHandler);
			row.removeEventListener("mouseup", mouseUpHandler);
			row.removeEventListener("mousemove", mouseMoveHandler);
			row.removeEventListener("wheel", wheelHandler);
		};
	};

	useEffect(() => {
		const removeMouseScrollMovies = addMouseScroll(movieRowRef);
		const removeMouseScrollFavorites = addMouseScroll(favoritesRowRef);

		return () => {
			removeMouseScrollMovies();
			removeMouseScrollFavorites();
		};
	}, []);

	return (
		<div className="container-fluid movie-app">
			<div className="row d-flex align-items-center mt-4 mb-4">
				<MovieListHeading heading="Movies" />
				<SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
			</div>
			<div className="row movie-row" ref={movieRowRef}>
				<MovieList
					movies={movies}
					handleFavoritesClick={addFavoriteMovie}
					favoriteComponent={AddFavorites}
				/>
			</div>
			<div className="row d-flex align-items-center mt-4 mb-4">
				<MovieListHeading heading="Favorites" />
			</div>
			<div className="row movie-row" ref={favoritesRowRef}>
				<MovieList
					movies={favorites}
					handleFavoritesClick={removeFavoriteMovie}
					favoriteComponent={RemoveFavorites}
				/>{" "}
			</div>
		</div>
	);
};

export default App;
