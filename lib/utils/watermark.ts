export const addWatermark = (file: File, watermarkText = "Corona Marine") => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return reject("Could not get canvas context");

        const MAX_WIDTH = 1920;
        const scale = Math.min(1, MAX_WIDTH / img.width);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const fontSize = canvas.width / 25; // Slightly larger for better visibility
        const opacity = 0.15; // Slightly more visible
        const angle = -45 * (Math.PI / 180);

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Measure text width to determine dynamic spacing
        const metrics = ctx.measureText(watermarkText);
        const textWidth = metrics.width;
        const spacingX = textWidth * 2; // Double the text width for clear separation
        const spacingY = textWidth * 1.5; // Vertical spacing

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        // Calculate diagonal coverage
        const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

        for (let x = -diag; x < diag; x += spacingX) {
          for (let y = -diag; y < diag; y += spacingY) {
             // Offset every other row for a brick pattern
             const xOffset = (y / spacingY) % 2 === 0 ? 0 : spacingX / 2;
             ctx.fillText(watermarkText, x + xOffset, y);
          }
        }

        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Canvas export failed");

            const watermarkedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".jpg"),
              { type: "image/jpeg" }
            );

            resolve(watermarkedFile);
          },
          "image/jpeg",
          0.85
        );
      };

      img.onerror = () => reject("Failed to load image");
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
