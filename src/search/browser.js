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

        // Initialize state.
        this.state = this.props.initialState;

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
                <SearchResults results={this.state.results}/>
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
        this.setState({
            currentPage: pageNumber
        })
    }
}

/**
 * When DOM ready, initialize the browser.
 */
$(document).ready(function() {
    const targetElement = $('#villager-browser');
    const initialState = targetElement.data('initial-state');
    ReactDOM.render(<Browser id="browser" initialState={initialState}/>, targetElement[0]);
})
