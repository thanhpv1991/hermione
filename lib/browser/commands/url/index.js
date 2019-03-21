/* global window, document */
'use strict';

module.exports = (browser) => {
    const {publicAPI: session, config} = browser;

    if (!config.resetCursor) {
        return;
    }

    const baseUrl = session.url.bind(session);

    session.addCommand('url', async (...args) => {
        const baseUrlResult = await baseUrl(...args);
        const executionContext = session.executionContext;

        try {
            session.actions([{
                type: 'pointer',
                id: `reset-cursor-position_${executionContext.browserId}_${executionContext.ctx.currentTest.id()}`,
                actions: [
                    {type: 'pointerMove', duration: 0, 'x': 0, 'y': 0}
                ]
            }]);

            await session.actions();
        } catch (actionsCommandError) {
            try {
                // In some browsers cursor move may not discrete.
                // Thus, hover event can be triggered on elements, which appear on the transition path
                // between current cursor position and the top left corner.
                await session.execute(function() {
                    window.__hermioneBodyPointerEvents = document.body.style.pointerEvents;
                    document.body.style.pointerEvents = 'none';
                });
                await session.scroll('body', 0, 0);
                await session.moveToObject('body', 0, 0);
                await session.execute(function() {
                    document.body.style.pointerEvents = window.__hermioneBodyPointerEvents;
                    delete window.__hermioneBodyPointerEvents;
                });
            } catch (e) {
                console.warn(e);
            }
        }

        return baseUrlResult;
    }, true);
};
