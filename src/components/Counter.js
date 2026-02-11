// Counter.js

export default function Counter(props, context) {
    const { getState, setState, db } = context;

    async function increment() {
        const currentCount = getState('count', 0);
        const newCount = currentCount + 1;
        setState('count', newCount);
        await db.write({ _id: 'counter', value: newCount });
    }

    async function decrement() {
        const currentCount = getState('count', 0);
        const newCount = currentCount - 1;
        setState('count', newCount);
        await db.write({ _id: 'counter', value: newCount });
    }

    return {
        div: {
            children: [
                {span: {text: () => `Count: ${getState('count', 0)}`}},
                {button: {
                    text: 'Increment', 
                    onclick: increment
                }},
                {button: {
                    text: 'Decrement', 
                    onclick: decrement
                }}
            ]
        }
    };
}