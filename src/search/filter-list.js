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
        let counter = 0; // for unique ID for each form element.
        for (let filterId of Object.keys(this.props.availableFilters)) {
            let filter = this.props.availableFilters[filterId];
            const valueOptions = [];
            for (let valueId of Object.keys(filter.values)) {
                let label = filter.values[valueId];
                const isApplied = this.isFilterApplied(filterId, valueId);
                valueOptions.push((
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox"
                               data-filter-id={filterId} value={valueId} id={filterId + '-' + counter}
                               checked={isApplied}/>
                        <label className="form-check-label" htmlFor={filterId + '-' + counter}>
                            {label}
                        </label>
                    </div>
                ));
                counter++;
            }
            filters.push((
                <div className="mb-3">
                    <div className="mb-1 font-weight-bold">{filter.name}</div>
                    {valueOptions}
                </div>
            ));
        }
        return filters;
    }

    isFilterApplied(filterId, valueId) {
        if (this.props.appliedFilters) {
            if (this.props.appliedFilters[filterId]) {
                return this.props.appliedFilters[filterId].includes(valueId);
            }
        }

        return false;
    }
}
