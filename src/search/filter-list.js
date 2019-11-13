import React from "react";

/**
 *
 */
export default class FilterList extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
    }

    /**
     *
     * @returns {*}
     */
    render() {
        const filters = [];

        // Show already-applied filters, if any.
        const alreadyApplied = [];
        for (let filterId in this.props.appliedFilters) {
            const values = this.props.appliedFilters[filterId].map((v) => {
                return this.props.availableFilters[filterId].values[v];
            });
            const valuesString = values.sort().join(', ');

            alreadyApplied.push(
                <li key={filterId}>
                    <span className="font-weight-bold">
                        {this.props.availableFilters[filterId].name}
                    </span>: {valuesString}
                    <a href="#" className="ml-2" onClick={this.removeFilterClicked.bind(this, filterId)}>
                        <span className="fas fa-times sr-hidden" style={{color: 'red'}}></span>
                        <span className="sr-only">Delete filter</span>
                    </a>
                </li>
            )
        }
        if (alreadyApplied.length > 0) {
            filters.push(
                <div className="mb-3" key="already-applied">
                    <div className="mb-1 font-weight-bold">Applied Filters</div>
                    <ul className="list-unstyled">
                        {alreadyApplied}
                    </ul>
                </div>
            );
        }

        // Build out the available filters list, and add state information to it.
        let counter = 0; // for unique ID for each form element.
        for (let filterId in this.props.availableFilters) {
            let filter = this.props.availableFilters[filterId];
            const valueOptions = [];
            for (let valueId in filter.values) {
                let label = filter.values[valueId];
                const isApplied = this.isFilterApplied(filterId, valueId);
                valueOptions.push((
                    <div className="form-check" key={filterId + '-' + counter}>
                        <input className="form-check-input" type="checkbox"
                               data-filter-id={filterId} value={valueId} id={filterId + '-' + counter}
                               onChange={this.toggleFilterValue.bind(this, filterId, valueId)}
                               checked={isApplied} />
                        <label className="form-check-label" htmlFor={filterId + '-' + counter}>
                            {label}
                        </label>
                    </div>
                ));
                counter++;
            }
            filters.push((
                <div className="mb-3" key={filterId}>
                    <div className="mb-1 font-weight-bold">{filter.name}</div>
                    {valueOptions}
                </div>
            ));
        }
        return filters;
    }

    /**
     *
     * @param filterId
     * @param valueId
     * @returns {*|boolean|boolean}
     */
    isFilterApplied(filterId, valueId) {
        if (this.props.appliedFilters) {
            if (this.props.appliedFilters[filterId]) {
                return this.props.appliedFilters[filterId].includes(valueId);
            }
        }

        return false;
    }

    /**
     * Toggle the given filter. Then, call the parent to let it know we changed.
     *
     * @param filterId
     * @param valueId
     * @param e
     */
    toggleFilterValue(filterId, valueId, e) {
        const appliedFilters = this.props.appliedFilters;

        if (appliedFilters[filterId] && appliedFilters[filterId].includes(valueId)) {
            // If already applied, remove it.
            appliedFilters[filterId] = appliedFilters[filterId].filter((v) => { return v !== valueId; });
            if (appliedFilters[filterId].length === 0) {
                delete appliedFilters[filterId]; // clean it up!
            }
        } else {
            // If not applied, add it.
            if (!appliedFilters[filterId]) {
                // Create the filter entry if not existing.
                appliedFilters[filterId] = [];
            }
            appliedFilters[filterId].push(valueId);
        }

        this.props.onFilterChange(appliedFilters);
    };

    removeFilter(filterId) {
        const appliedFilters = this.props.appliedFilters;
        delete appliedFilters[filterId];

        this.props.onFilterChange(appliedFilters);
    };

    removeFilterClicked(filterId, e) {
        e.preventDefault();
        this.removeFilter(filterId);
    }
}
