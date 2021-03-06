import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";
const Rating = lazy(() => import('./components/Rating.jsx'));
const Reviews = lazy(() => import('./components/Reviews.jsx'));
const ReviewList = lazy(() => import('./components/ReviewList.jsx'));
const RatingList = lazy(() => import('./components/RatingList.jsx'));
const TotalRating = lazy(() => import('./components/TotalRating.jsx'));
const ReviewModal = lazy(() => import("./components/Modal/ReviewModal.jsx"));
import $ from 'jquery';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ratings: [],
      reviews: [],
      avgRating: 0,
      showAllReviews: false,
      hover: false,
      searchTerm: '',
      searchContainer: [],
      modalFilteredReviews: []
    }
  }

  componentDidMount() {
    this.getReviews();
    this.getRatings();
  }

  getReviews() {
    let url = window.location.href
    let listingID = url.split('/')[3];

    $.ajax({
      url: `http://54.215.44.35:80/${listingID}/reviews`,
      type: 'GET',
      success: (res) => {
        this.setState({
          reviews: res,
          modalFilteredReviews: res
        })
      },
      error: (err)=>{
        console.error(err);
      }
    });
  }

  getRatings() {
    let url = window.location.href
    let listingID = url.split('/')[3];

    $.ajax({
      url: `http://54.215.44.35/${listingID}/averageReviewsRating`,
      type: 'GET',
      success: (res) => {
        this.setState({
          ratings: [res],
          avgRating: res.averageRating
        })
      },
      error: (err)=>{
        console.error(err);
      }
    });
  }

  showModal() {
    if(this.state.showAllReviews) {
      this.setState({
        showAllReviews: false
      })
      document.body.style.overflow = 'scroll';
    } else {
      // collapse modal
      this.setState({
        showAllReviews: true,
        modalFilteredReviews: this.state.reviews
      })
      document.body.style.overflow = 'hidden';
    }
  }

  hoverOverButtonColor(e) {
    e.target.style.background = '#F8F8F8';
  }

  noLongerOverButtonColor(e) {
    e.target.style.background = "white";
  }

  handleKeyDown(e) {
    if(e.key === 'Enter') {
      this.dynamicSearch()
      this.state.searchContainer.push(this.state.searchTerm)
    }
  }

  editSearch(e) {
    this.setState({
      searchTerm: e.target.value
    })
  }

  dynamicSearch() {
    this.setState({
      modalFilteredReviews: this.state.reviews.filter(review => review.reviewDescription.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
    })
  }

  renderLoading() {
    return <p>Loading</p>
  }

  render() {
      return (
      <div className="App" style={{
        height: "100%",
        paddingTop: "48px",
        paddingLeft: "40px",
        paddingRight: "40px",
        maxWidth: "1280px",
        minWidth: "744px",
        marginLeft: "10%",
        marginRight: "10%"
        }}>
          <Suspense fallback = {this.renderLoading()}>
            <TotalRating finalRating={this.state.avgRating.toFixed(2)} totalReviews={this.state.reviews.length}/>
          </Suspense>
          <Suspense fallback = {this.renderLoading()}>
            <RatingList rating={this.state.ratings}/>
          </Suspense>
          <Suspense fallback = {this.renderLoading()}>
            <ReviewList reviews={this.state.reviews}/>
          </Suspense>
          <Suspense fallback = {this.renderLoading()}>
            {this.state.reviews.length > 6 ?
            <div style={{paddingTop: '32px'}}>
              <ShowAllReviewsButton
              onMouseEnter={this.hoverOverButtonColor.bind(this)}
              onMouseLeave={this.noLongerOverButtonColor.bind(this)}
              onClick={this.showModal.bind(this)} style={{color:'black',cursor:'pointer'}}>
                Show all {this.state.reviews.length} reviews
            </ShowAllReviewsButton>
            </div> : null}
          </Suspense>
          <Suspense fallback = {this.renderLoading()}>
            {this.state.showAllReviews ?
              <ReviewModal
              rating={this.state.ratings}
              showingModal={this.state.showAllReviews}
              finalRating={this.state.avgRating}
              totalReviews={this.state.reviews.length}
              reviewsList={this.state.reviews}
              closeModal={this.showModal.bind(this)}
              handleKeyDown={this.handleKeyDown.bind(this)}
              searchTerm={this.state.searchTerm}
              searchTermDisplay={this.state.searchContainer}
              searchInput={this.editSearch.bind(this)}
              filteredSearch={this.state.modalFilteredReviews}/>
              : null}
          </Suspense>
          <div style={{borderBottomWidth: "1px", borderBottomStyle:"solid", color:"#DDDDDD",paddingTop: "48px"}}></div>
        </div>
      );
  }
}

const ShowAllReviewsButton = styled.button `
  cursor: pointer;
  display: inline-block;
  margin: 0px;
  position: relative;
  text-align: center;
  text-decoration: none;
  width: auto;
  touch-action: manipulation;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  outline: none;
  padding: 13px 23px;
  border-color: rgb(34, 34, 34);
  background: rgb(255, 255, 255);
  color: rgb(34, 34, 34);
`;

ReactDOM.render(<App />, document.getElementById('Review'));
