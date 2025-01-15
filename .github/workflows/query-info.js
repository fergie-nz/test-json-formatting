import {Octokit} from '@octokit/core';
import OpenAI from "openai";
import { sendMessageToTelegram, waitForThumbsUpReaction, postTweet, filter_out_bots, map_to_simplify } from './utils.js';
// import fs from 'fs';
const openai = new OpenAI();

const octokit = new Octokit({
    auth: process.env.GITHUB_PAT, // Read from environment variable
});


async function fetchComments() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const test = "fdasdsad fasfas";

        const intro_blurb = "Introduction Welcome to Open mSupply for Desktop, Web & Android! History Open mSupply builds on over 20 years of mSupply, over which time it has become the most used Logistics Management Information System (LMIS) in low & middle income countries. What platforms are supported?🔗 Open mSupply runs on Desktop (Windows, Linux & Mac), as a web application in your browser, or also as an Android application (for tablets, not for phones at this stage). Where can I download it? We provide a number of downloads on our releases page hosted in our GitHub repository. The latest version will be shown at the top of the list of releases - we generally recommend using the latest version where possible. Within each release there is an Assets section which has the files you need to install Open mSupply. Windows There are installers built for each release, providing: Server: which supports either SQLite or PostgreSQL and runs as a windows service. The installer name for the server is Open_mSupply_Server_[version].exe Desktop: A windows application which allows you to connect to a running server. The installer name for the server is Open_mSupply_Desktop_[version].exe Standalone: combines the above two; runs a server as a windows service and has a windows application which will connect to it. The installer name for the server is Open_mSupply_Standalone_[version].exe Demo: A pre-configured server installation which does not require a central server to run. The installer name for the server is Open_mSupply_Demo_[version].exe Android The android version is distributed as an .apk file which you can install. This file has the name open-msupply-[version]-release.apk MacOS For the mac desktop version, we provide a .dmg file, which has the name Open_mSupply_[version].dmg. What does it do? In short, Open mSupply manages your inventory, recording every receipt and issue of goods, and thereby providing a running balance of your stock on hand for each item. Open mSupply does much more than that. Features include: Inventory management Easily see per-batch stock on hand Manage shelf locations for your store/warehouse Assign locations to incoming stock, or change locations as you rearrange stock in your warehouse Perform stocktakes, and assign reasons for inventory adjustments Repack stock Receive and fulfil orders from customers (facilities you supply) Place orders with your supplying store Quantify amounts required based on simple or complex formulas Track order status as your supplying store fulfils and ships the order! Receive goods into stock when the order arrives Be alerted to low stock levels from the dashboard Perform basic dispensing Manage patient records Create a prescription for a patient Manage cold chain View logs from temperature sensors Upload data from USB temperature loggers Be alerted of temperature excursions and breaches Connect temperature monitoring devices to stock via stock locations Extend functionality of the base system with the use of front-end plugins. These allow for custom development of simple tasks such as adding fields to records which can then be displayed in lists and editing forms. For further details, see the plugin readme. What makes Open mSupply special? There are a lot of systems that manage inventory. Open mSupply has unique features that make it ideal to use for health supply chains in low resource settings: Offline first: Open mSupply is designed from the ground up to work without internet. We know from 20 years of experience that even the most reliable internet connections sometimes fail or get overloaded. Open mSupply allows you to work without having to worry about second-by-second internet quality. Of course, when you need to place orders or receive updates from other facilities, you need internet for a few minutes then. Scalable: We've designed Open mSupply to handle billions of transactions a year, but to also work on an Android tablet! You can implement Open mSupply in one facility, knowing that if you later decide to deploy thousands of sites, Open mSupply will still be the right tool. To get some insight into the full breadth of Open mSupply's functionality, have a look at the legacy mSupply software documentations at https://www.msupply.org.nz - it's almost 1000 pages if you print it all (so maybe don't ☺️) Terminology The following table outlines some of the common terms used in Open mSupply, and also guides users of legacy mSupply regarding terminology improvements we have made. Open mSupply Term Legacy mSupply term Definition Outbound Shipment Customer Invoice The creation of a supply of goods to a particular customer (facility) Inbound Shipment Supplier Invoice The receiving of a supply of goods from a particular supplier Inbound Shipment Supplier Invoice The receiving of a supply of goods from a particular supplier Requisition Customer Requisitions An order for supply of goods made by a particular customer (facility) Internal Orders Supplier Requisitions A request for stock made to a particular supplier (facility) Supplier Return Supplier Credit The return of supplied goods to a particular supplier (facility) Customer Return Customer Credit The receiving of a return of goods from a particular customer (facility) Getting Started To run Open mSupply you will require an mSupply server to operate as a central server. While we are planning to create a new open source central server, that is not yet available. Note that we are also currently working through testing the migration process and the integration of Open mSupply with an existing mSupply system. As such, we aren't recommending that you upgrade without talking to us first. Installation Preconditions You need an existing mSupply system with a Legacy mSupply server with web and sync server modules. You can read more about the hardware requirements for Legacy mSupply server here As of December 2023, it is not possible to migrate an existing Legacy (or Mobile) mSupply store to an Open mSupply store; only new stores can be created in Open mSupply Procedure: Any Open mSupply stores need to be created in the Legacy mSupply central server as detailed in Creating new stores. Note that turning an existing customer into a store is not currently supported for Open mSupply sites. Users need to be created and configured for the store(s) in the Legacy mSupply central server as detailed in Managing Users The Open mSupply site needs to be created in the Legacy mSupply central server as detailed in Creating New Sync Sites The store(s) will need to be added to the Open mSupply site in the Legacy mSupply central server as detailed in Adding stores Deploy Open mSupply to your device from the Open mSupply GitHub repository. Consult with TMF support to make sure that you are deploying the correct version Initiate Open mSupply on the device. You should see something like the screen below. URL: Consult with TMF support to make sure that you have the correct URL Site name: As entered in Creating New Sync Sites Password: As entered in Creating New Sync Sites";
        

        // Format the date in ISO 8601 format
        // const since = oneWeekAgo.toISOString();
        // const comments_response = await octokit.request('GET /repos/msupply-foundation/open-msupply/issues/comments', {
        //     owner: 'OWNER',
        //     repo: 'REPO',
        //     headers: {
        //         'X-GitHub-Api-Version': '2022-11-28',
        //     },
        //     since,
        //     per_page: 10000,
        // });

        // const issues_response = await octokit.request('GET /repos/msupply-foundation/open-msupply/issues', {
        //     owner: 'OWNER',
        //     repo: 'REPO',
        //     headers: {
        //         'X-GitHub-Api-Version': '2022-11-28',
        //     },
        //     since,
        //     per_page: 10000,
        // });

        // const commentsWithoutBots = filter_out_bots(comments_response.data);

        // const comments = map_to_simplify(commentsWithoutBots);

        // TODO remove comment
        // const completion = await openai.chat.completions.create({
        //     model: "gpt-3.5-turbo",
        //     messages: [
        //         { role: "system", content: "You are a helpful assistant." },
        //         {
        //             role: "user",
        //             content: `Here are some comments from GitHub issues on TMF's msupply repo:\n\n${comments}\n\n Also here are the issues they refer to:\n\n${issues_response.data}\n\nThese are both based on the previous weeks' work. Based on these comments and issues, please generate a summary post of what we've been up to this week for socials. Please be moderately specific in what issues were worked on, but also use your judgement on what would be best for socials. Approx 100-200 words is great. Do not worry about any preface like 'sure, here you go!'. Please generate this response in markdown format. Some more context you might find helpful is: Basically everyone working on this is part of the TMF org. Also, could you make this post slightly more layperson accessible? Also using standardised hashtags would be awesome - some flexibility but maybe always use a :rocket and #TMF. Also here is the intro to OMS blurb which could also be helpful context: ${intro_blurb}`,
        //         },
        //     ],
        // });

        // const generatedContent = completion.data.choices[0].message.content;

        const generatedContent = 'test generated content'

        const message = await sendMessageToTelegram(generatedContent, process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID);
        await waitForThumbsUpReaction(message, generatedContent, process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID, process.env.TWITTER_SECRET);



        // fs.writeFileSync('./generated_post.md', generatedContent, 'utf8');

    } catch (error) {
        console.error('Error:', error);
      }


}

fetchComments();



