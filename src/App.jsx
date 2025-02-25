import { useState, useEffect } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import {useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from "./appWrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

//added env variable to netlify

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};



const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [debounceSearchTerm,setDebounceSearchTerm]=useState('')
  const [trendingMovies,setTrendingMovies]=useState([])



  const fetchMovies = async (query='') => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      
      

      if (data.response === "False") {
        setErrorMessage("Failed to fetch Movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results)

      if (query && data.results.length>0){
        await updateSearchCount(query,data.results[0])
      }
    } catch (error) {
      console.error("Error fetching movies: ", error);
      setErrorMessage("Error fetching movies. Please try again later. ");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async()=>{
    try{
       const movies = await getTrendingMovies()

       setTrendingMovies(movies)
    }catch(error){
      console.log(error);
      
    } }

  useDebounce (()=> setDebounceSearchTerm(searchTerm),500,[searchTerm])

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);


  useEffect(()=>{
    loadTrendingMovies()
  },[])

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            {" "}
            Find <span className="text-gradient"> Movies </span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          ></Search>
        </header>
        

        {trendingMovies.length>0&&(<section className="trending">
          <h2>Trending Movies</h2>

          <ul>
            {trendingMovies.map((movie,index)=>(
              <li key={movie.$id}>
                <p>{index+1}</p>
                <img src={movie.poster_url} alt={movie.title} />
              </li>
            ))}
          </ul>
        </section>)}


        <section className="all-movies">
          <h2 >All Movies</h2>
          {isloading ? (
           <Spinner></Spinner>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
               <MovieCard key={movie.id} movie={movie}></MovieCard>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
