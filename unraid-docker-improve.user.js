// ==UserScript==
// @name         Unraid Docker Improve
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Improve Unraid Docker UI.
// @author       libook
// @match        */Docker/UpdateContainer?*
// @match        */Docker/AddContainer
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACNElEQVR4Ae3TAYTedRwG8M/vv9tCUjVSKCTFe9t2unJKaGbTlEIUKEskAaYkAlXVQgBmQwg0QoUSCWaCUFmUBNzdai0U2eV+3ye44zWv8Z7egfsAgOf7eL5mZdu2beuv779h/Y39B/tb+29zBYNZibvF6ZQjVyXApZf2XXfp5X0vrL2y7xCkG9Jdo+yA/s7Cnnp34Vi9t3D7bBoo14tXUx6HlCg9XUBlMfGmcudMAqRIRwHKz4mnxZeQEj3SE2Pmfnto/oPWfHHz1+c+MoW/n9u7sw2OaXoq76fTBhJg19vf/YlPbUjHgAbU8YWnDB4eVI4mlkyrzKU8ohxp2o6UpJMy2WUNpSwpR4cUerZceYoUKlL+1a2bIKVS1sY2IZ1BJ2Vq6WNXRRN/SJ5NnDBJ+Uo8kfiezfAxl0JMryJp2kBo1574YQ1nTLCxiVWsjjfYMLc5ni01MIQgzdSKhDlFAqzeP9rdmkWDc7ec+XHZZS4+Or9Ha7s136SkIY0mWzyAIRUpQOxNnFYOmCDxouSkuFFkbAdTS6EzpKMC0jVlV8pgkm4uZWcq0sc/wfR6pBiUUylnJ/3q5NdDp9GVT1I+U7opJc6qnDJueWF0YPme0T8ri6NnNjZxx/kHRo+df3B0E/x+cP7khUPzv144PH+r/8lgTCpNj5QG4nDiQ+UuMFb5TAIovyReU/l2cxO6HZuBUj4Wx5W/XA0ri6PnV+4dXVy5b7RkRgZXkPK5eFL8ZNu2bTPyH971YupUFEzmAAAAAElFTkSuQmCC
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    {
        let styleString = '';

        // Make input wider
        styleString += `
                #canvas input[type="text"] {
                    width: 100%;
                }
            `;

        // Change background of dl

        styleString += `
                dt {
                    text-align: right;
                    margin-right: 1em;
                    padding-top: 4px;
                }
            `;

        styleString += `
                .user-docker-attr-type-path:before {
                    content: "📁";
                }
                .user-docker-attr-type-port:before {
                    content: "📡";
                }
                .user-docker-attr-type-env:before {
                    content: "📝";
                }
                .user-docker-attr-type-label:before {
                    content: "🏷️";
                }
            `;

        const styleElement = document.createElement('style');
        styleElement.innerHTML = styleString;
        document.head.append(styleElement);
    }

    const callback = () => {

        // Labeling Docker config type
        {

            const TYPE_REGEXP_MAP = {
                "PATH": /^Container Path:/,
                "PORT": /^Container Port:/,
                "ENV": /^Container Variable:/,
                "LABEL": /^Container Label:/,
            };
            [
                ...document.querySelectorAll('div.config_always > dl > dd > span > span'),
                ...document.querySelectorAll('div.config_always-hide > dl > dd > span > span'),
                ...document.querySelectorAll('div.config_advanced > dl > dd > span > span'),
                ...document.querySelectorAll('div.config_advanced-hide > dl > dd > span > span'),
            ].forEach(item => {
                let finalType = null;

                for (let type in TYPE_REGEXP_MAP) {
                    if (TYPE_REGEXP_MAP[type].test(item.innerText)) {
                        finalType = type.toLowerCase();
                    }
                }

                if (finalType !== null) {
                    const labelElement = item.parentElement.parentElement.parentElement.querySelector('dt>span');
                    labelElement.classList.add(`user-docker-attr-type-${finalType}`);
                }
            })
        }

    };

    let isRunningCallback = false;

    // Select the node that will be observed for mutations
    const targetNodeList = [
        document.getElementById("configLocation"),
        document.getElementById("configLocationAdvanced"),
    ];

    for (let targetNode of targetNodeList) {
        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: true };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(() => {
            if (!isRunningCallback) {
                isRunningCallback = true;
                callback();
                setTimeout(() => {
                    isRunningCallback = false;
                }, 1000);
            }
        });

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }

})();
