## <img src="assets/vibrant.svg" width="64" alt="Logo" title="vibrant Logo"> vibrantCrankshaft

A Steam Deck plugin (for Crankshaft) to adjust screen saturation / vibrancy based on [vibrantDeck](https://github.com/libvibrant/vibrantDeck) from [Scrumplex](https://github.com/Scrumplex)

![Screenshot of Deck UI](assets/screenshot.jpg)

![Example Screenshot](assets/mockup.webp)

## Build instrutions

1. Clone the repository.
2. In your clone of the repository run these commands:
   1. `make dist`
3. Copy the plugin to the Crankshaft plugins directory
4. Alternatively, if SSH is running on the target device, run `make remote-update SSH_USER=deck SSH_HOST=<ip>`

# License

This project is licensed under the terms of the GNU General Public License 3.0. You can read the full license
text in [LICENSE](LICENSE).
