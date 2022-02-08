import { User, UserAccountPlatform } from '@/model/users';
import { shortenEthAddress } from '.';

export const getUsername = (user: User): string | undefined => {
  let username = '';
  if (Array.isArray(user.accounts) && user.accounts.length > 0) {
    for (const account of user.accounts) {
      username = account.username;
      // Prefer DISCORD over others
      if (account.platform === UserAccountPlatform.DISCORD) break;
    }
  } else if (username === '')
    return shortenEthAddress(user.ethereumAddress)?.toString();
  return username;
};

export const psudonymAdjectives = [
  'Red',
  'Green',
  'Blue',
  'Sad',
  'Happy',
  'Wild',
  'Faint',
  'Harsh',
  'Howling',
  'Loud',
  'Melodic',
  'Noisy',
  'Purring',
  'Quiet',
  'Rapping',
  'Raspy',
  'Rhythmic',
  'Wailing',
  'Ancient',
  'Early',
  'Fast',
  'Future',
  'Late',
  'Long',
  'Modern',
  'Old',
  'Prehistoric',
  'Quick',
  'Rapid',
  'Short',
  'Slow',
  'Swift',
  'Young',
  'Original',
  'Funky',
  'Black',
  'Proud',
  'Humble',
  'Cool',
  'Lucky',
  'Hungry',
  'Nervous',
  'Calm',
  'Frisky',
  'Crazy',
  'Bored',
  'Passionate',
  'Brave',
  'Adventurous',
  'Lovesick',
  'Peaceful',
  'Ponderous',
  'Dashing',
  'Balanced',
  'Seductive',
];

export const pseudonymNouns = [
  'Mackerel',
  'Gazelle',
  'Armadillo',
  'Unicorn',
  'Trout',
  'Salmon',
  'Coyote',
  'Beaver',
  'Moose',
  'Goose',
  'Reindeer',
  'Caribou',
  'Groundhog',
  'Kangaroo',
  'Wombat',
  'Parakeet',
  'Crab',
  'Lobster',
  'Bee',
  'Beetle',
  'Giraffe',
  'Lion',
  'Panther',
  'Cougar',
  'Lynx',
  'Hummingbird',
  'Butterfly',
  'Toucan',
  'Raptor',
  'Mustang',
  'Dodge Caravan',
  'Brontosaurus',
  'Quetzalcoatl',
  'Moloch',
  'Cariblanco',
  'Lemur',
  'Octopus',
  'Calamari',
  'Fettucini Carbonara',
  'Lasagna',
  'Spork',
  'Polar Bear',
  'Harbour Seal',
  'Jackalope',
  'Great Oak',
  'Turkey',
  'Guinea Fowl',
  'Hamster',
  'Kingfisher',
  'Sparrow',
  'Starling',
  'Robin',
  'Chickadee',
  'Herron',
  'Knight',
  'Lotus',
  'Cactus',
  'Sunflower',
  'Eagle',
  'Falcon',
  'Wolf',
  'Pizza',
  'Elf',
  'Ghost',
  'Phantom',
  'Cheetah',
  'Husky',
  'Cat',
  'Cod',
  'Badger',
  'Aardvark',
  'Bat',
  'Crocodile',
  'Alligator',
  'Deer',
  'Dingo',
  'Dolhpin',
  'Dove',
  'Dragonfly',
  'Duck',
  'Ferret',
  'Fox',
  'Gecko',
  'Frog',
  'Taco',
  'Hawk',
  'Mars',
  'Venus',
  'Neptune',
  'Jellyfish',
  'Frisbee',
  'Kookaburra',
  'Llama',
  'Owl',
  'Oyster',
  'Rabbit',
  'Gryphon',
  'Basilisk',
  'Sphinx',
  'Chimaera',
  'Dragon',
  'Zebra',
  'Shiba',
  'Herring',
  'Patatas Bravas',
  'Quesadilla',
  'Schwarma',
  'Kebab',
  'Tofu',
  'Meme',
  'Cheeseburger',
  'Commoner',
  'Tokenizer',
  'Hatcher',
  'Egg',
  'Whale',
  'Squid',
  'Thinker',
  'Sleeper',
  'Zombie',
  'Snek',
  'Macaw',
  'Ant',
  'Carrot',
  'Chickpea',
  'Lemon',
  'Jedi',
  'Seagull',
  'Millenium Falcon',
  'Potato',
  'Carrot',
];