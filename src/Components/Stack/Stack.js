import React from 'react';
import '../../Styles/Stack/Stack.css';
import { Color } from '../../Utils/Color';
import StackItem from './StackItem';

class Stack extends React.Component {
    state = {
        stack: [new Color('da71d6', 0, true), new Color('87cefa', 100, false)],
    };

    render() {
        const { stack } = this.state;

        const renderStack = stack.map((color) => <StackItem color={color} />);

        return (
            <div className='stack-container'>
                <h2>STACK</h2>
                <div className='stack-container-label'>
                    <p />
                    <p>HEX</p>
                    <p>STOP</p>
                </div>
                {renderStack}
            </div>
        );
    }
}

export default Stack;
