import React from "react";

/**
 *
 */
export default class SearchResults extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
    }

    buildResults() {
        const list = [];
        for (let result of this.props.results) {
            list.push(
                <li className="col-6 col-sm-4 col-md-3">
                    <div className="villager-result-container">
                        <div className="villager-result-image">
                            <a href={'/villager/' + result.id}>
                                <img src={'/images/villagers/medium/' + result.id + '.png'}
                                     alt={'Picture of ' + result.name} className="img-responsive align-middle" />
                            </a>
                        </div>
                        <div className="villager-result-link">
                            <a href={'/villager/' + result.id}>{result.name}</a>
                        </div>
                    </div>
                </li>
            );
        }

        return list;
    }
    /**
     *
     * @returns {*}
     */
    render() {
        // No results case.
        if (this.props.results.length === 0) {
            return (
                <p>There were no results for your search.</p>
            );
        }

        // Build result list.
        return (
            <ul className="list-unstyled row">
                {this.buildResults()}
            </ul>
        );
    }
}
