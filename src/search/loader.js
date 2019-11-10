import React from "react";

/**
 *
 */
export default class Loader extends React.Component {
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
        return (
            <div className="loader-overlay">
                <div className="sk-chase">
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                </div>
            </div>
        );
    }
}
