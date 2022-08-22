/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const particle = ({Particle, log}) => {

/* global service */

const service = 'https://kgsearch.googleapis.com/v1/entities:search?key=AIzaSyBCeldVawFK1N9h8LKn6NCV6zQclsfQZTM&limit=1';

const template = Particle.html`
<!--
<style>
  qna-tool {
    border: 1px solid lightblue;
    padding: 2px;
  }
</style>
-->
<qna-tool passage="{{passage}}" question="{{ask}}" on-answers="onAnswers"></qna-tool>
`;

const Datfield = `James Hetfield (born August 3, 1963) is an American musician and songwriter, best known as the co-founder, lead vocalist, rhythm guitarist and primary songwriter for heavy metal band Metallica. He is mainly known for his intricate rhythm playing, but occasionally performs lead guitar duties and solos, both live and in the studio. Hetfield co-founded Metallica in October 1981 after answering an advertisement by drummer Lars Ulrich in the Los Angeles newspaper The Recycler. Metallica has won nine Grammy Awards and released ten studio albums, three live albums, four extended plays and 24 singles.`;

return class extends Particle {
  get template() {
    return template;
  }
  render({ask}, {artist}) {
    // qnat.passage = "Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware. It is considered one of the Big Four technology companies, alongside Amazon, Apple, and Facebook. Google was founded in September 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in California. Together they own about 14 percent of its shares and control 56 percent of the stockholder voting power through supervoting stock. They incorporated Google as a California privately held company on September 4, 1998, in California. Google was then reincorporated in Delaware on October 22, 2002. An initial public offering (IPO) took place on August 19, 2004, and Google moved to its headquarters in Mountain View, California, nicknamed the Googleplex. In August 2015, Google announced plans to reorganize its various interests as a conglomerate called Alphabet Inc. Google is Alphabet's leading subsidiary and will continue to be the umbrella company for Alphabet's Internet interests. Sundar Pichai was appointed CEO of Google, replacing Larry Page who became the CEO of Alphabet."
    // qnat.question = "Who is the CEO of Google?"
    // qnat.addEventListener('answers', (e) => console.log(e));
    log({
      passage: Datfield,
      //passage: artist?.detailedDescription,
      ask
    });
    return {
      passage: Datfield,
      //passage: artist?.detailedDescription,
      ask
    };
  }
  update({find}, state) {
    // If we are asynchronously populating data, wait until this is done before
    // handling additional updates.
    if (find && !state.receiving) {
      if (find.length) {
        find = find[0];
      }
      if (find && find !== state.find) {
        state.find = find;
        this.fetchArtist(find);
      }
    }
    this.output();
  }
  // async fetchArtist(find) {
  //   try {
  //     const search = encodeURI(find.name);
  //     const url = `http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${search}`;
  //     const response = await Particle.utils.fetch(url);
  //     const data = await response.json();
  //     log(data);
  //   } finally {
  //     this.state = {receiving: false};
  //   }
  // }
  // async fetchArtist2(find) {
  //   try {
  //     const search = encodeURI(find.name);
  //     const url = `https://en.wikipedia.org/w/api.php?format=json&action=parse&prop=text&section=0&page=${search}`;
  //     const response = await Particle.utils.fetch(url);
  //     const data = await response.json();
  //     //
  //     var markup = data.parse.text["*"];
  //     this.state = {result: markup};
  //   } finally {
  //     this.state = {receiving: false};
  //   }
  // }
  async fetchArtist(find) {
    this.state = {receiving: true};
    try {
      const response = await Particle.utils.fetch(`${service}&query=${encodeURI(find.name)}`);
      const artists = await response.json();
      this.receiveArtists(artists);
    } finally {
      this.state = {receiving: false};
    }
  }
  async receiveArtists(artists) {
    //log(artists);
    if (artists.error) {
      log(artists.error);
    } else if (artists.itemListElement.length === 0) {
      log('No results in the knowledge graph.');
    } else {
      const result = artists.itemListElement[0].result;
      const artist = {
        artistid: result['@id'],
        type: result['@type'].join(','),
        name: result.name,
        description: result.description,
        imageUrl: result.image?.contentUrl,
        detailedDescription: result.detailedDescription?.articleBody
      };
      log(artist);
      log(' ');
      log(artist.detailedDescription);
      log(' ');
      this.state = {artist};
      //this.output({artist});
    }
  }
  onAnswers({eventlet: {value}}) {
    log(value);
  }
};

};
