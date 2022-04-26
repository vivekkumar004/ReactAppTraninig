import styles from "./App.module.css";
import List from "./components/List";
import InputWithLabel from "./components/InputWithLabel";
import logo from "./assets/logo.png";
import usePersistence from "./hooks/usePersistence";
import React, { useEffect, useMemo, useReducer, useCallback } from "react";
import axios from "axios";
import { useDebounce } from "./hooks/useDebounce";
import { StateType, StoryType, ActionType } from "./types";

const title: string = "React Training";

function storiesReducer(state: StateType, action: ActionType) {
  switch (action.type) {
    case "SET_STORIES":
      return { data: action.payload.data, isError: false, isLoading: false };
    case "INIT_FETCH":
      return { ...state, isLoading: true, isError: false };
    case "FETCH_FAILURE":
      return { ...state, isLoading: false, isError: true };
    case "REMOVE_STORY":
      const filteredState = state.data.filter(
        (story: any) => story.objectID !== action.payload.id
      );
      return { data: filteredState, isError: false, isLoading: false };
    default:
      return state;
  }
}

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

function App(): JSX.Element {
  const [searchText, setSearchText] = usePersistence("searchTerm", "React");
  const debouncedUrl = useDebounce(API_ENDPOINT + searchText);

  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isError: false,
    isLoading: false,
  });

  const sumOfComments = useMemo(
    () =>
      stories.data.reduce(
        (acc: number, current: StoryType) => acc + current.num_comments,
        0
      ),
    [stories]
  );

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "INIT_FETCH" });
    try {
      const response = await axios.get(debouncedUrl);
      dispatchStories({
        type: "SET_STORIES",
        payload: { data: response.data.hits },
      });
    } catch {
      dispatchStories({ type: "FETCH_FAILURE" });
    }
  }, [debouncedUrl]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  const handleDeleteClick = useCallback((objectId: number) => {
    dispatchStories({ type: "REMOVE_STORY", payload: { id: objectId } });
  }, []);

  if (stories.isError) {
    return (
      <h1 style={{ marginTop: "10rem", color: " red" }}>
        Something went wrong
      </h1>
    );
  }

  return (
    <div>
      <nav>
        <div className={styles.heading}>
          <h1>{title}</h1>
          <img src={logo} />
        </div>
        <p>Sum: {sumOfComments}</p>
        <InputWithLabel
          searchText={searchText}
          onChange={handleChange}
          id="searchBox"
        >
          Search
        </InputWithLabel>
      </nav>
      {stories.isLoading ? (
        <h1 style={{ marginTop: "10rem" }}>Loading</h1>
      ) : (
        <List listOfItems={stories.data} onClickDelete={handleDeleteClick} />
      )}
    </div>
  );
}

export default App;