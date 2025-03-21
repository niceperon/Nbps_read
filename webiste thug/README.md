# Red & Black Cursor Clicker Game

An interactive website featuring cursor animations and a clicker game with auto-click functionality.

## How to Add Your Custom Image

1. Save your image as `clickimage.jpg` in the same directory as the HTML file
2. Make sure the image is appropriately sized (square format works best)
3. If your image has a different format (e.g., PNG), you can either:
   - Convert it to JPG, or
   - Change the image source in the HTML from `clickimage.jpg` to your file name

## Sound Effects

The game includes sound effects for:
- Clicking
- Purchasing upgrades
- Reaching milestones

To add your own sounds:
1. Replace the placeholder files in the `sounds` folder:
   - `click.mp3` - Played when clicking
   - `upgrade.mp3` - Played when purchasing upgrades
   - `milestone.mp3` - Played when reaching score milestones

## Features

- Custom cursor effects that follow your mouse
- **Interactive background elements that respond to cursor movement**
- **Cursor trail effect that leaves a temporary path as you move**
- Click counter with score tracking
- Particle animations when clicking
- Auto-clicker upgrade system
- Dynamic background animations
- Custom clickable image
- Red and black theme
- **Game progress automatically saved** to local storage
- **Sound effects** for clicks and upgrades
- **Statistics tracking** with easy-to-view panel
- **Milestone celebrations** with fireworks animations
- Responsive design for different screen sizes

## How to Run

1. Simply open the `index.html` file in your web browser
2. Click the image button to increase your score
3. Purchase upgrades when you have enough points:
   - Click upgrade: increases the value of each click
   - Auto-clicker: automatically clicks for you
4. View your statistics by clicking the stats button in the bottom right
5. Your progress is automatically saved
6. **Move your cursor around to see the background react to your movement**

## Game Controls

- **Left Click**: Increase your score
- **Mouse Movement**: Background elements follow your cursor position
- **Hover**: Watch the cursor change when hovering over buttons
- **Upgrades**: Purchase to improve your clicking power and automation
- **Stats Button**: View your game statistics and reset progress if desired

## Technologies Used

- HTML5
- CSS3 (with animations and transitions)
- Vanilla JavaScript (no frameworks)
- Local Storage API for saving game progress 