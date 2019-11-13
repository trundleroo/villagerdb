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

        this.state = {};
        this.state.availableFilters = this.props.availableFilters;
        this.state.appliedFilters = this.props.appliedFilters;
    }

    /**
     *
     * @returns {*}
     */
    render() {
        const filters = [];
        let counter = 0; // for unique ID for each form element.
        for (let filterId of Object.keys(this.state.availableFilters)) {
            let filter = this.state.availableFilters[filterId];
            const valueOptions = [];
            for (let valueId of Object.keys(filter.values)) {
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
        if (this.state.appliedFilters) {
            if (this.state.appliedFilters[filterId]) {
                return this.state.appliedFilters[filterId].includes(valueId);
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
        const appliedFilters = this.state.appliedFilters;

        if (appliedFilters[filterId] && appliedFilters[filterId].includes(valueId)) {
            // If already applied, remove it.
            appliedFilters[filterId] = appliedFilters[filterId].filter((v) => { return v !== valueId; });
        } else {
            // If not applied, add it.
            if (!appliedFilters[filterId]) {
                // Create the filter entry if not existing.
                appliedFilters[filterId] = [];
            }
            appliedFilters[filterId].push(valueId);
        }

        this.setState({
            appliedFilters: appliedFilters
        });

        this.props.onFilterChange(appliedFilters);
    }
}
