import React from "react";

type ClockState = {
    time: Date
}
export class Clock extends React.Component<{}, ClockState> {
    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
            <h2>It is {this.state.time.toLocaleTimeString()}.</h2>
         </div>);
    }
}
