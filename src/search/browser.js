import React from "react";
import ReactDOM from "react-dom"
import $ from 'jquery'

import Paginator from './paginator.js';
import SearchResults from './search-results.js';

/**
 *
 */
class Browser extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            startIndex: 1,
            endIndex: 25,
            totalCount: 475,
            totalPages: 19,
            results: []
        };

        // Bindings
        this.setPage = this.setPage.bind(this);
    }

    /**
     *
     * @returns {*}
     */
    render() {
        return (
            <div id={this.props.id}>
                <Paginator onPageChange={this.setPage}
                           currentPage={this.state.currentPage}
                           startIndex={this.state.startIndex}
                           endIndex={this.state.endIndex}
                           totalCount={this.state.totalCount}
                           totalPages={this.state.totalPages}/>
                <SearchResults results={this.state.searchResults}/>
                <Paginator onPageChange={this.setPage}
                           currentPage={this.state.currentPage}
                           startIndex={this.state.startIndex}
                           endIndex={this.state.endIndex}
                           totalCount={this.state.totalCount}
                           totalPages={this.state.totalPages}/>
            </div>
        );
    }

    setPage(pageNumber) {
        console.log(pageNumber);
        this.setState({
            currentPage: pageNumber
        })
    }
}

/**
 * When DOM ready, initialize the browser.
 */
$(document).ready(function() {
    const targetElement = document.getElementById('villager-browser');
    if (targetElement) {
        ReactDOM.render(<Browser id="browser" />, targetElement);
    }
})
